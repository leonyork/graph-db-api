/**
 * From https://medium.com/@didil/serverless-testing-strategies-393bffb0eef8
 */
const kill = require('tree-kill');
const { spawn } = require('child_process');

let neo4jProcess;
let slsOfflineProcess;

beforeAll(async() => {
    //Allow neo4j + sls to start
    jest.setTimeout(30000);

    console.log("[Tests Bootstrap] Start");
    await Promise.all([startNeo4j(), startSlsOffline()]);
    console.log("[Tests Bootstrap] Done");
});

afterAll(async() => {
    console.log("[Tests Teardown] Start");
    await Promise.all([stopSlsOffline(), stopNeo4j()]);
    console.log("[Tests Teardown] Done");
});


// Helper functions

async function startNeo4j() {
    return new Promise((resolve, reject) => {
        let noColorEnv = process.env;
        noColorEnv.FORCE_COLOR = 0;
        neo4jProcess = spawn("docker", ["run", "--publish=7687:7687", "--env", "NEO4J_AUTH=neo4j/test", "neo4j"], { env: noColorEnv });
        console.log(`neo4j starting with PID : ${neo4jProcess.pid}`);

        neo4jProcess.stdout.on('data', (data) => {
            if (data.includes("Started.")) {
                console.log(`Neo4j started`);
                resolve();
            }
            //console.log(data.toString());
        });

        neo4jProcess.stderr.on('data', (errData) => {
            console.log(`Error starting neo4j:\n${errData}`);
            reject(errData);
        });
    });
}

async function stopNeo4j() {
    return new Promise((resolve, reject) => {
        neo4jProcess.on('exit', () => {
            console.log("Neo4j stopped");
            resolve();
        })
        kill(neo4jProcess.pid, 'SIGINT', (err) => {
            if (err) { reject(err) }
        });
    });
}

async function startSlsOffline() {
    return new Promise((resolve, reject) => {
        let noColorEnv = process.env;
        noColorEnv.FORCE_COLOR = 0;
        slsOfflineProcess = spawn("sls", ["offline", "start"], { env: noColorEnv });
        console.log(`Serverless: Offline starting with PID : ${slsOfflineProcess.pid}`);

        slsOfflineProcess.stdout.on('data', (data) => {
            if (data.includes("Offline listening on")) {
                const listeningLogging = data.toString().trim();
                process.env.USER_STORE_API_SECURED_TEST_URL = listeningLogging.match(/(http|https)\:\/\/[a-zA-Z0-9]*\:[0-9]*$/g)[0];
                console.log(`Serverless offline running on ${process.env.USER_STORE_API_SECURED_TEST_URL}`);
                resolve();
            }
            console.log(data.toString());
        });

        slsOfflineProcess.stderr.on('data', (errData) => {
            console.log(`Error starting Serverless Offline:\n${errData}`);
            reject(errData);
        });
    });
}

async function stopSlsOffline() {
    return new Promise((resolve, reject) => {
        slsOfflineProcess.on('exit', () => {
            console.log("Serverless Offline stopped");
            resolve();
        })
        kill(slsOfflineProcess.pid, 'SIGINT', (err) => {
            if (err) { reject(err) }
        });
    });
}