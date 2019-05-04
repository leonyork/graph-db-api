'use strict';
const { put } = require('../repository')

module.exports.handler = async(event) => {
    const type = event.pathParameters.type.toLowerCase();
    if (!/^[a-z]*$/.test(type)) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: "Not Found"
            }),
        };
    }

    let data;
    try {
        data = JSON.parse(event.body);
    } catch (err) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Body supplied is not JSON data" })
        };
    }

    try {
        const result = await put(type, event.pathParameters.id, data)
        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Bad Request"
            })
        }
    }
};