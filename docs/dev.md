# Miecd Web Technical Guide

The intended audience for this document is any technical-minded person with an interest in maintaining, enhancing or adding new code and features to this project. The assumption here is that the said person is familiar with the primary business objective of this project

-   local dev setup
-   authentication
-   admin pieces
-   external dependencies

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

for more information on the full list of executable commands and build customization please refer the create react app template [readme](https://github.com/facebook/create-react-app/blob/main/packages/cra-template/template/README.md)

## external dependencies

Worthwhile external data sources that are crucial to how the web app runs include:

1. [OpenSRP]() - the web app makes requests to the opensrp server to get authentication details of the currently logged in user, i.e they profile information as well as any location assignments that could have.
2. [Discover]() - Discover is an ETL tool with integrated data analytics that the web app uses as a rest api server to get data collated from submissions by health care workers.
3. [keycloak]() - identity and authentication management
4. [Opensrp-web]() - will look at this a bit more later on, for now, we borrow a few packages used for administration purposes, like creating new users and access control management.

## code structure

## authentication
