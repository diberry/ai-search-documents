targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the the environment which is used to generate a short unique hash used in all resources.')
param environmentName string

@minLength(1)
@description('Location for AI Search and Storage resources')
// Constrained due to semantic ranker availability: https://learn.microsoft.com/azure/search/search-region-support#americas
@allowed([
  'brazilsouth'
  'canadacentral'
  'canadaeast'
  'eastus2'
  'northcentralus'
  'westus'
  'westus2'
  'westcentralus'
  'northeurope'
  'francecentral'
  'switzerlandnorth'
  'switzerlandwest'
  'uksouth'
  'australiaeast'
  'eastasia'
  'southeastasia'
  'centralindia'
  'jioindiawest'
  'japanwest'
  'koreacentral'
])
@metadata({
  azd: {
    type: 'location'
  }
})
param location string

param resourceGroupName string = ''

param logAnalyticsName string = ''

param searchEndpoint string = ''
param searchServiceName string = ''
param searchServiceResourceGroupName string = ''
param searchServiceLocation string = ''
// The free tier does not support managed identity (required) or semantic search (optional)
@allowed(['free', 'basic', 'standard', 'standard2', 'standard3', 'storage_optimized_l1', 'storage_optimized_l2'])
param searchServiceSkuName string
param searchIndexName string
param searchSemanticConfiguration string
param searchServiceSemanticRankerLevel string
var actualSearchServiceSemanticRankerLevel = (searchServiceSkuName == 'free')
  ? 'disabled'
  : searchServiceSemanticRankerLevel
param searchIdentifierField string
param searchContentField string
param searchTitleField string
param searchEmbeddingField string
param searchUseVectorQuery bool

param storageAccountName string = ''
param storageResourceGroupName string = ''
param storageResourceGroupLocation string = location
param storageContainerName string = 'content'
param storageSkuName string

param tenantId string = tenant().tenantId

@description('Id of the user or app to assign application roles')
param principalId string = ''

var abbrs = loadJsonContent('abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = { 'azd-env-name': environmentName }

@description('Whether the deployment is running on GitHub Actions')
param runningOnGh string = ''

@description('Whether the deployment is running on Azure DevOps Pipeline')
param runningOnAdo string = ''

// Figure out if we're running as a user or service principal
var principalType = empty(runningOnGh) && empty(runningOnAdo) ? 'User' : 'ServicePrincipal'

// Organize resources in a resource group
resource resourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

resource searchServiceResourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' existing = if (!empty(searchServiceResourceGroupName)) {
  name: !empty(searchServiceResourceGroupName) ? searchServiceResourceGroupName : resourceGroup.name
}

resource storageResourceGroup 'Microsoft.Resources/resourceGroups@2021-04-01' existing = if (!empty(storageResourceGroupName)) {
  name: !empty(storageResourceGroupName) ? storageResourceGroupName : resourceGroup.name
}

module logAnalytics 'br/public:avm/res/operational-insights/workspace:0.7.0' = {
  name: 'loganalytics'
  scope: resourceGroup
  params: {
    name: !empty(logAnalyticsName) ? logAnalyticsName : '${abbrs.operationalInsightsWorkspaces}${resourceToken}'
    location: location
    tags: tags
    skuName: 'PerGB2018'
    dataRetention: 30
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
    useResourcePermissions: true
  }
}

module searchService 'br/public:avm/res/search/search-service:0.7.1' = {
  name: 'search-service'
  scope: searchServiceResourceGroup
  params: {
    name: !empty(searchServiceName) ? searchServiceName : 'gptkb-${resourceToken}'
    location: !empty(searchServiceLocation) ? searchServiceLocation : location
    tags: tags
    disableLocalAuth: true
    sku: searchServiceSkuName
    replicaCount: 1
    semanticSearch: actualSearchServiceSemanticRankerLevel
    // An outbound managed identity is required for integrated vectorization to work,
    // and is only supported on non-free tiers:
    managedIdentities: { systemAssigned: true }
    roleAssignments: [
      {
        roleDefinitionIdOrName: 'Search Index Data Reader'
        principalId: principalId
        principalType: principalType
      }
      {
        roleDefinitionIdOrName: 'Search Index Data Contributor'
        principalId: principalId
        principalType: principalType
      }
      {
        roleDefinitionIdOrName: 'Search Service Contributor'
        principalId: principalId
        principalType: principalType
      }
    ]
  }
}

module storage 'br/public:avm/res/storage/storage-account:0.9.1' = {
  name: 'storage'
  scope: storageResourceGroup
  params: {
    name: !empty(storageAccountName) ? storageAccountName : '${abbrs.storageStorageAccounts}${resourceToken}'
    location: storageResourceGroupLocation
    tags: tags
    kind: 'StorageV2'
    skuName: storageSkuName
    publicNetworkAccess: 'Enabled' // Necessary for uploading documents to storage container
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
    }
    allowBlobPublicAccess: false
    allowSharedKeyAccess: false
    blobServices: {
      deleteRetentionPolicyDays: 2
      deleteRetentionPolicyEnabled: true
      containers: [
        {
          name: storageContainerName
          publicAccess: 'None'
        }
      ]
    }
    roleAssignments: [
      {
        roleDefinitionIdOrName: 'Storage Blob Data Reader'
        principalId: principalId
        principalType: principalType
      }
      // For uploading documents to storage container:
      {
        roleDefinitionIdOrName: 'Storage Blob Data Contributor'
        principalId: principalId
        principalType: principalType
      }
    ]
  }
}


// Necessary for integrated vectorization, for search service to access storage
module storageRoleSearchService 'role.bicep' =  {
  scope: storageResourceGroup
  name: 'storage-role-searchservice'
  params: {
    principalId: searchService.outputs.systemAssignedMIPrincipalId
    roleDefinitionId: '2a2b9908-6ea1-4ae2-8e65-a410df84e7d1' // Storage Blob Data Reader
    principalType: 'ServicePrincipal'
  }
}

output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenantId
output AZURE_RESOURCE_GROUP string = resourceGroup.name

output AZURE_SEARCH_ENDPOINT string = 'https://${searchService.outputs.name}.search.windows.net'
output AZURE_SEARCH_INDEX string = searchIndexName
output AZURE_SEARCH_SEMANTIC_CONFIGURATION string = searchSemanticConfiguration
output AZURE_SEARCH_IDENTIFIER_FIELD string = searchIdentifierField
output AZURE_SEARCH_CONTENT_FIELD string = searchContentField
output AZURE_SEARCH_TITLE_FIELD string = searchTitleField
output AZURE_SEARCH_EMBEDDING_FIELD string = searchEmbeddingField
output AZURE_SEARCH_USE_VECTOR_QUERY bool = searchUseVectorQuery

output AZURE_STORAGE_ENDPOINT string = 'https://${storage.outputs.name}.blob.core.windows.net'
output AZURE_STORAGE_ACCOUNT string = storage.outputs.name
output AZURE_STORAGE_CONNECTION_STRING string = 'ResourceId=/subscriptions/${subscription().subscriptionId}/resourceGroups/${storageResourceGroup.name}/providers/Microsoft.Storage/storageAccounts/${storage.outputs.name}'
output AZURE_STORAGE_CONTAINER string = storageContainerName
output AZURE_STORAGE_RESOURCE_GROUP string = storageResourceGroup.name
