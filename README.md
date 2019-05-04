# Graph DB API

Provides an API for storing data in neo4j

## Installation
You'll need to have [NPM](https://www.npmjs.com/), the [Serverless Framework](https://serverless.com/) and [Docker](https://www.docker.com/get-started)

- To install NPM, you'll need to download it from https://www.npmjs.com/get-npm
- Once NPM is installed you can run `npm install -g serverless` to install the Serverless Framework
- Now run `npm install` to install the required packages for this application

## Environment variables

When running locally or deploying to development environment variables will be loaded from .env.development. You can create this file based on .env.example

For more information see https://www.npmjs.com/package/serverless-dotenv-plugin

## Local
`npm run offline`

#### Setup some test data

```bash
curl -X GET http://localhost:3000/user/alice
curl -X PUT http://localhost:3000/user/alice -d '{}'
curl -X GET http://localhost:3000/user/alice
curl -X PUT http://localhost:3000/user/bob -d '{"age": "35"}'
curl -X GET http://localhost:3000/user/bob
curl -X PUT http://localhost:3000/user/chai -d '{"occupation": "manager"}'
curl -X PUT http://localhost:3000/company/acme-inc -d '{}'
curl -X PUT http://localhost:3000/user/alice/friend -d '{"type": "user", "id": "bob", "met": "2000-01-01Z"}'
curl -X PUT http://localhost:3000/user/alice/friend -d '{"type": "user", "id": "chai", "met": "2010-01-01Z"}'
curl -X PUT http://localhost:3000/user/chai/employed -d '{"type": "company", "id": "acme-inc", "started": "2015-01-01Z"}'
curl -X GET http://localhost:3000/user/alice/friend
curl -X GET http://localhost:3000/user/alice/friend/user/bob
```
#### View the data

Open ```http://localhost:7474/browser/``` and login with user neo4j and password test (these credentials are only used locally)
Run ```MATCH (users:user) RETURN users``` in the command line at the top.

## Deploy

You will need a [Neo4j license](https://neo4j.com/licensing/) to deploy.

To deploy development run `sls deploy`

To deploy production run `sls deploy -s production`

You'll need to make sure you use a valid AMI ID for the region you want to deploy to. This can be done using AWS CLI:

```bash
aws ec2 describe-images --owners amazon --filters 'Name=name,Values=amzn2-ami-hvm-2.0.????????-x86_64-gp2' 'Name=state,Values=available' --output json --region us-east-1 | jq -r '.Images | sort_by(.CreationDate) | last(.[]).ImageId'

aws ec2 describe-images --owners amazon --filters 'Name=name,Values=amzn2-ami-hvm-2.0.????????-x86_64-gp2' 'Name=state,Values=available' --output json --region us-east-1 | jq -r '.Images | sort_by(.CreationDate) | last(.[]).ImageId'
```

## Tests

Run all tests with `npm run test`

### Unit Tests

In the `.test.` files alongside the source. Run with `npm run unit`

### Integration Tests

In the `test/integration` folder. Run with `npm run integration`

## CI/CD

Uses [LambCI](https://github.com/lambci/lambci) to build on a push to GitHub. As part of the build, we'll run the tests against a functions and database created in the cloud.

If all is successful, deploys to production.