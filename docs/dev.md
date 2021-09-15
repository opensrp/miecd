# Miecd Web Technical Guide

The intended audience for this document is any technical-minded person with an interest in maintaining, enhancing or adding new code and/or features to this project. The assumption here is that the whomever picks up this work is familiar with the contextual problem that this project attempts to solve. please refer to the readme for an [overview](../README.md)

## Getting Started

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

#### `yarn test`

Launches the test runner in the interactive watch mode.

For more information on the full list of executable commands and build customization please refer the create react app template [readme](https://github.com/facebook/create-react-app/blob/main/packages/cra-template/template/README.md)

## Stack

This app is built using:

-   React
-   Redux
-   React-query
-   I18next

## external dependencies

External data sources that are crucial to how the web app runs include:

1. [OpenSRP](github.com/openSRP/server-web) - The opensrp server holds profile information about the logged in user, for instance assignments made to that user.
2. [Discover](https://discover.miecd-stage.smartregister.org/superset/welcome) - Discover is an ETL tool with integrated data analytics that the web app uses as a rest api server to get data collated from submissions by health care workers.
3. [keycloak](https://www.keycloak.org/) - Identity and authentication management tool
4. [Opensrp-web](https://github.com/opensrp/web) - Contains a few modules that we need, the user management module, location management, and teams management module.

## authentication

Authentication happens via oauth2. The app can either use implicit or authorization code flow. This behavior is configurable by supplying the env variable `REACT_APP_BACKEND_ACTIVE`. When set to true, you should also setup a simple server that serves the built static files. In addition, the server should expose several endpoints that can be used to facilitate an authorization grant type code flow, an example can be found [here](github.com/onaio/express-server). If `REACT_APP_BACKEND_ACTIVE` is false then the app uses implicit grant type and only requires the correct redirection urls to be correctly configured.

A more in-depth write up of the authentication workflow can be found [here](https://github.com/onaio/express-server/tree/master/docs)

## Admin pieces

The admin menu contains 3 modules:

-   user management
-   location management
-   teams management

These are all developed as npm packages over at the opensrp-web repo. To make changes to these modules:

1. Make contributions to the opensrp-web repo which is publicly maintained
2. Once the pr is merged, the repository maintainers will publish them to npm
3. Update their versions here.

### Roles and user groups

Each user should be assigned to at-lest one user groups. This determines what modules they have access to on the web. The default roles and user groups and their associated access levels are documented [here](https://github.com/opensrp/miecd/issues/62)

## Read the code

For more, and for the specificities of code-structure, components and container views, we encourage you to read the code.
