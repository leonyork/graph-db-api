const slsw = require('serverless-webpack');

module.exports = {
    mode: 'production',
    entry: slsw.lib.entries,
    //No need to include aws-sdk in the package as it's provided by AWS
    externals: [{ 'aws-sdk': 'commonjs aws-sdk' }]
};