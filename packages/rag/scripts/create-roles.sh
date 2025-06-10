#!/bin/bash

# Variables - Replace with your actual values
SEARCH_SERVICE_NAME="ai-search-dib-2" 
#"your-search-service"
SEARCH_RG="ai-search"
OPENAI_SERVICE_NAME="dib-sweden-openai"
#"your-openai-service"
OPENAI_RG="dib-sweden"
RESOURCE_GROUP_NAME="your-resource-group"

# Get current user object ID
USER_OBJECT_ID=$(az ad signed-in-user show --query id -o tsv)
echo "Current user object ID: $USER_OBJECT_ID"

# Configure Azure AI Search for role-based access
echo "Configuring Azure AI Search for role-based access..."
az search service update \
  --name $SEARCH_SERVICE_NAME \
  --resource-group $SEARCH_RG \
  --auth-type "aad"

# Get resource IDs
SEARCH_RESOURCE_ID=$(az search service show \
  --name $SEARCH_SERVICE_NAME \
  --resource-group $SEARCH_RG \
  --query id -o tsv)

OPENAI_RESOURCE_ID=$(az cognitiveservices account show \
  --name $OPENAI_SERVICE_NAME \
  --resource-group $OPENAI_RG \
  --query id -o tsv)

# Assign Azure AI Search roles
echo "Assigning Azure AI Search roles..."
az role assignment create \
  --assignee $USER_OBJECT_ID \
  --role "Search Index Data Contributor" \
  --scope $SEARCH_RESOURCE_ID

az role assignment create \
  --assignee $USER_OBJECT_ID \
  --role "Search Service Contributor" \
  --scope $SEARCH_RESOURCE_ID

az role assignment create \
  --assignee $USER_OBJECT_ID \
  --role "Search Index Data Reader" \
  --scope $SEARCH_RESOURCE_ID

# Assign Azure OpenAI role
echo "Assigning Azure OpenAI role..."
az role assignment create \
  --assignee $USER_OBJECT_ID \
  --role "Cognitive Services OpenAI User" \
  --scope $OPENAI_RESOURCE_ID

echo "Role assignments completed. It may take several minutes for permissions to take effect."

# Verify assignments
echo "Verifying role assignments..."
echo "Azure AI Search roles:"
az role assignment list \
  --assignee $USER_OBJECT_ID \
  --scope $SEARCH_RESOURCE_ID \
  --output table

echo "Azure OpenAI roles:"
az role assignment list \
  --assignee $USER_OBJECT_ID \
  --scope $OPENAI_RESOURCE_ID \
  --output table