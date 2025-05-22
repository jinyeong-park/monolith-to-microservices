# Product Recommendation Service

_This Node.js-based service provides product recommendations based on popularity, category, price, or specific product IDs._ It runs locally on _port 8084_ and can be deployed to Google Cloud Functions.

## Table of Contents

- [Running Locally](#running-locally)
- [Test Commands](#test-commands)
- [Browser Testing](#browser-testing)
- [Deploying to GCP Cloud Functions](#deploying-to-gcp-cloud-functions)
- [Managing the Function](#managing-the-function)
- [Notes and Prerequisites](#notes-and-prerequisites)

## Running Locally

_To start the service locally_, run:

```bash
npm start
```

_This launches the application on `http://localhost:8084`._

### Running Tests

_To execute tests_ using the `test` script in `package.json`:

```bash
npm test
```

## Test Commands

_Test the service locally_ on _port 8084_ using these `curl` commands:

### 1. Popular Products

```bash
curl "http://localhost:8084?type=popular&limit=3"
```

### 2. Vintage Category with Price Filter

```bash
curl "http://localhost:8084?category=vintage&maxPrice=100"
```

### 3. Category-Based Recommendation

```bash
curl "http://localhost:8084?type=category&productId=OLJCESPC7Z&limit=3"
```

### 4. Price-Based Recommendation

```bash
curl "http://localhost:8084?type=price&productId=1YMWWN1N4O&limit=3"
```

### 5. Photography Category Filter

```bash
curl "http://localhost:8084?category=photography&limit=2"
```

## Browser Testing

_You can test the service directly in a browser_ by visiting these URLs to view _JSON responses_:

- _Popular Products_: `http://localhost:8084?type=popular&limit=3`
- _Vintage Category with Price Filter_: `http://localhost:8084?category=vintage&maxPrice=100`
- _Category-Based Recommendation_: `http://localhost:8084?type=category&productId=OLJCESPC7Z&limit=3`

## Deploying to GCP Cloud Functions

### 1. Set Up GCP Project and gcloud CLI

```bash
# _Authenticate gcloud CLI_
gcloud auth login

# _Set your GCP project_ (replace YOUR_PROJECT_ID with your actual project ID)
gcloud config set project YOUR_PROJECT_ID

# _Verify current project_
gcloud config get-value project

# _Enable required APIs_
gcloud services enable cloudfunctions.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2. Verify Deployment Files

_Ensure the following files are in your project directory_:

- _`index.js`_ (recommendation function code)
- _`package.json`_ (configured for port 8084)
- _`node_modules/`_ (generated via `npm install`)

_Check files_:

```bash
ls -la
```

### 3. Deploy to Cloud Functions

_Deploy the function with default settings_:

```bash
gcloud functions deploy recommendProducts \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point recommendProducts \
  --source . \
  --timeout 60s \
  --memory 256MB
```

_For more specific settings_:

```bash
gcloud functions deploy recommendProducts \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point recommendProducts \
  --source . \
  --timeout 60s \
  --memory 256MB \
  --region us-central1 \
  --max-instances 10
```

_To update to Node.js 20_:

```bash
gcloud functions deploy recommendProducts \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point recommendProducts \
  --source . \
  --timeout 60s \
  --memory 256MB
```

### 4. Verify Deployment

_Check the deployed function's details_:

```bash
gcloud functions describe recommendProducts
```

_Get the function's URL_:

```bash
gcloud functions describe recommendProducts --format="value(httpsTrigger.url)"
```

### 5. Test Deployed Function

_After deployment, the function URL will be in the format_:

```
https://REGION-YOUR_PROJECT_ID.cloudfunctions.net/recommendProducts
```

_Set the URL as a variable_ (replace with your actual URL):

```bash
FUNCTION_URL="https://us-central1-YOUR_PROJECT_ID.cloudfunctions.net/recommendProducts"
```

_Test commands for the deployed function_:

#### 1. Popular Products

```bash
curl "${FUNCTION_URL}?type=popular&limit=3"
```

#### 2. Category Filtering

```bash
curl "${FUNCTION_URL}?category=vintage&maxPrice=100"
```

#### 3. Category-Based Recommendation

```bash
curl "${FUNCTION_URL}?type=category&productId=OLJCESPC7Z&limit=3"
```

#### 4. Price-Based Recommendation

```bash
curl "${FUNCTION_URL}?type=price&productId=1YMWWN1N4O&limit=3"
```

## Managing the Function

### View Logs

_Monitor logs in real-time_:

```bash
gcloud functions logs tail recommendProducts
```

_View recent logs_:

```bash
gcloud functions logs read recommendProducts --limit 50
```

### Update or Delete Function

_Update the function after code changes_:

```bash
gcloud functions deploy recommendProducts \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point recommendProducts \
  --source .
```

_Delete the function if needed_:

```bash
gcloud functions delete recommendProducts
```

## Notes and Prerequisites

- _Project ID_: Verify the correct project is set with `gcloud config get-value project`.
- _APIs_: Ensure Cloud Functions and Cloud Build APIs are enabled.
- _Permissions_: Confirm you are logged in with an account that has deployment permissions.
- _Billing_: A billing account must be linked to the GCP project.
