# Cargo Middleware

The Cargo Middleware is an AWS S3 Client middleware which takes place after the AWS signing portion to add the signature from the Cargo Server.  For each request, the middleware will capture the request, authenticate the JWT, check for authorization to access the given resource, then provide the AWS signature and body hash. 

## Using the Middleware

For example usage of the middleware see `samples/src/main.ts` which shows a working example. Add in your Cargo Server endpoint and a working JWT to try the sample.