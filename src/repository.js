'use strict';
const neo4j = require('neo4j-driver').v1;
const driver = neo4j.driver(
    'bolt://localhost',
    neo4j.auth.basic('neo4j', 'test')
);

const run = async(cmd, ret, params) => {
    const session = driver.session()
    return await new Promise((resolve, reject) => {
        let result = []
        session
            .run(cmd, params)
            .subscribe({
                onNext: function(record) {
                    result.push(record.get(ret).properties)
                },
                onCompleted: function() {
                    session.close();
                    resolve(result)
                },
                onError: function(error) {
                    reject(error)
                },
            });
    });
}

module.exports.get = async(type, id) => {
    const response = await run(`MATCH (u:${type}) WHERE u.id = {id} RETURN u`, 'u', { id: id })
    if (response.length == 0) { return null }
    var { id, ...result } = response[0]
    return result
}

module.exports.put = async(type, id, data) => {
    const response = await run(`MERGE (u:${type} {id: {data}.id}) 
        ON CREATE SET u = {data} 
        ON MATCH SET u = {data} 
        RETURN u`,
        'u', { data: Object.assign({ id: id }, data) }
    )
    var { id, ...result } = response[0]
    return result
}

module.exports.putRelationship = async(fromType, fromId, relationshipType, toType, toId, data) => {
    const response = await run(`MATCH (f:${fromType}) WHERE f.id = {fromId}
                MATCH (t:${toType}) WHERE t.id = {toId}
                MERGE (f)-[r:${relationshipType}]->(t) 
                ON CREATE SET r = {data} 
                ON MATCH SET r = {data} 
                RETURN r`,
        'r', { fromId: fromId, toId: toId, data: data }
    )
    if (response.length == 0) { return null }
    return Object.assign({ type: toType, id: toId }, response[0])
}

module.exports.getRelationship = async(fromType, fromId, relationshipType, toType, toId) => {
    const response = await run(`MATCH (f:${fromType}) WHERE f.id = {fromId}
            MATCH (t:${toType}) WHERE t.id = {toId}
            MATCH (f)-[r:${relationshipType}]->(t) RETURN r`,
        'r', { fromId: fromId, toId: toId }
    )
    if (response.length == 0) { return null }
    return response[0]
}

module.exports.getRelationships = async(fromType, fromId, relationshipType) => {
    const response = await run(`MATCH (f:${fromType}) WHERE f.id = {fromId}
              MATCH (f)-[:${relationshipType}]->(t) 
              RETURN t`,
        't', { fromId: fromId }
    )
    return response
}