# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

Just frontend:
UI (static)
This will apply to our marketing pages.  Currently, will have just one page, i.e the landing page at the root of our website.
The nextjs app should likely create static pages for these marketing pages.  

FrontEnd + Backend:
UI -> NextJs app -> AWS API Gateway -> AWS Lambda -> Dynamodb

UI -> NextJs app -> External API (e.g. Stripe API)
                 -> AWS API Gateway -> Aws Lambda -> Dynamodb
Our nextjs app is meant to provide an awesome frontend experience and act as an orchestrator of our intenal API (hosted on AWS API Gatway) and in some cases, external API (e.g. Stripe).  NextJs app NEVER reads from a database directly.  It always calls an API instead.
Both our nextjs app and our backend APIs (AWS APIGateway) are protected by Oauth2 using AWS Cognito.  More details are below the Authentication section.

Authentication:
UI -> NextAuth / NextJs middleware -> AWS Cognito
In our nextjs app, we use nextAuth and middleware to protect routes that require a login.  NextAuth should always use AWS Cognito as its Oauth Provider.  Even tho we support Google Sign in, nextjs app should not directly use Goolge as a OauthProvider, but rather delegate to AWS Cognito which will integrate with these Social providers.
Similar, our API is protected by AWS Cognito. AWS API Gateway has really good integration with AWS Cognito and that is what we should leverage.
Our JWT token that we create should contain the role of the user.  Role of the user is determined primary by the tier of the user.  E.g. Free tier, paid tier..  These tiers will have different roles and different claims to functionality.  


## Project Principles:
1) We use Vercel to host our NextJs app.  We use AWS to host our many backend services / apis.
2) Our frontend and backend strictly follow TDD "Red-Green-Refactor":
    a. Write the test first - Create a test for the functionality you want to build, even though the code doesn't exist yet
    b. Run the test and confirm it fails - This ensures your test is actually testing something and isn't passing by accident
    c. Write the minimum code needed - Implement just enough code to make the test pass
    d. Run the test again - Verify it now passes
    e. Refactor if needed - Clean up the code while keeping the test green
 3) Our frontend and backend are responsible for writing unit tests.  They should never write integration tests.  Mock external dependecies
 4) Our e2e directory is responsible for writing integration tests. No unit tests nor production code here.  Purely e2e is meant for integration tests e.g. real user workflows, API interactions, database connections, and cross-system functionality


## Project Structure

- **Backend** (`/backend/`) - Our backend logic that is hosted on AWS
- **Frontend** (`/frontend/`) -Our frontend logic (nextjs) that is hosted on Vercel
- **E2E Tests** (`/e2e/`) - Playwright integration tests for both API and UI testing

