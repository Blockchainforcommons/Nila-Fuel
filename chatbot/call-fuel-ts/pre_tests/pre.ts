
// functions to create and store wallets in dynamoDB.
export function NewUsers(event,context,callback){
  // import individual service
  var AWS = require('aws-sdk');
  AWS.config.update({region: 'ap-south-1'});

  var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
  
  var getparams = {
    TableName: 'TABLE',
    Key: {
      'KEY_NAME': {N: '001'}
    },
    ProjectionExpression: 'ATTRIBUTE_NAME'
  };

  var putparams = {
    TableName: 'CUSTOMER_LIST',
    Item: {
      'CUSTOMER_ID' : {N: '001'},
      'CUSTOMER_NAME' : {S: 'Richard Roe'}
    }
  };
  

  ddb.putItem(putparams, function(err, data) {
      if (err) {
        console.log("Error", err);
      } else {
        console.log("Success", data.Item);
      }
    });

  ddb.getItem(getparams, function(err, data) {
        if (err) {
          console.log("Error", err);
        } else {
          console.log("Success", data.Item);
        }
      });
  }
  // functions to generate NFTs and new assets.
  // etc.


NewUsers('','','')