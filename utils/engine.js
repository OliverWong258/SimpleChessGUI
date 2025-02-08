import fs from 'fs';
import { spawn } from 'child_process';
import readline from 'readline';

//保存引擎
export function saveDataToFile(engineData) {
    const filePath = './engine/engine.json';

    // 读取JSON文件
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件时出错：', err);
            return;
        }
        
        // 将JSON字符串解析为JavaScript对象
        const jsonData = data ? JSON.parse(data) : [];
        let isExists = 0;
        for (let idx in jsonData) {
            if (jsonData[idx]['path'] === engineData['path']) {
                jsonData[idx] = engineData;
                isExists = 1;
            }
        }
        if (!isExists)
            jsonData.push(engineData);

        // 将修改后的数组转换回JSON字符串
        const updatedData = JSON.stringify(jsonData, null, 2);

        // 写入文件
        fs.writeFile(filePath, updatedData, 'utf8', (err) => {
            if (err) {
                console.error('写入文件时出错：', err);
                return;
            }
        });
    });
}

//删除引擎
export function deleteEngine(engine) {
    const filePath = './engine/engine.json';

    // 读取JSON文件
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('读取文件时出错：', err);
            return;
        }

        // 将JSON字符串解析为JavaScript对象
        const jsonData = data ? JSON.parse(data) : [];
        let idx = null;
        for (let i in jsonData) {
            if (jsonData[i]['path'] === engine['path']) {
                idx = i;
            }
        }
        if (idx == null) {
            console.log("Error in delete Engine");
            return;
        }
        jsonData.splice(idx, 1);

        // 将修改后的数组转换回JSON字符串
        const updatedData = JSON.stringify(jsonData, null, 2);

        // 写入文件
        fs.writeFile(filePath, updatedData, 'utf8', (err) => {
            if (err) {
                console.error('写入文件时出错：', err);
                return;
            }
        });
    });
}

//加载引擎
export async function loadDataFromFile() {
    const filePath = './engine/engine.json';

    // 创建一个Promise对象以包装异步操作
    return new Promise((resolve, reject) => {
        // 读取JSON文件
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('读取文件时出错：', err);
                reject(err); // 如果出错，将Promise状态设置为rejected
                return;
            }
            // 将JSON字符串解析为JavaScript对象
            const jsonData = data ? JSON.parse(data) : [];
            resolve(jsonData); // 将读取的数据作为Promise的结果返回
        });
    });
}

async function startEngine(file_path) {
    let command = spawn(file_path, [], {
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true  // 隐藏窗口（仅在 Windows 平台有效）
    });

    return command;
}

async function getHandles(child) {
    let stdin = child.stdin;
    let stdout = child.stdout;
    let rl = readline.createInterface({
        input: stdout,
        crlfDelay: Infinity
    });

    return [stdin, rl];
}

//获取引擎信息
export async function getEngineConfig(path) {
    try {
        let child = await startEngine(path);
        let [stdin, rl] = await getHandles(child);
        stdin.write('uci\n');

        let config = { name: '', options: [] };

        for await (const line of rl) {
            // 解析 line 并更新 config 对象的内容
            if (line.startsWith('id name')) {
                config.name = line.substring(8);
            } else if (line.startsWith('option')) {
                config.options.push(line.substring(7));
            } else if (line.startsWith('uciok')) {
                rl.close();
                break;
            }
        }

        //console.log(config);
        child.kill('SIGTERM');
        return config;
    } catch (error) {
        // 处理异常
        console.error(error);
        throw new Error('Failed to get engine config');
    }
}

//uci交互
export async function runUciCommand(engine, gameFen) {
    try {
        const output = await uciCommand(engine, gameFen);
        return output;
    } catch (error) {
        console.error('Failed to get response from Stockfish:', error);
    }
}

let globalChildProcess = null;
async function uciCommand(engine, gameFen) {
    try {
        let initial = false;

        if (!globalChildProcess) {
            globalChildProcess = await startEngine(engine.path);
            initial = true;
        }
        let [stdin, rl] = await getHandles(globalChildProcess);

        if (initial) {
            if (engine.threads != undefined)
                stdin.write(`setoption name Threads value ${engine.threads}`);
            if (engine.hash != undefined)
                stdin.write(`setoption name Hash value ${engine.hash}`);
            if (engine.multiPV != undefined)
                stdin.write(`setoption name MultiPV value ${engine.multiPV}`);
            if (engine.skillLevel != undefined)
                stdin.write(`setoption name Skill Level value ${engine.skillLevel}`);
            if (engine.ponder) {
                stdin.write(`setoption name Ponder value ${engine.ponder}`);
            }
        }

        stdin.write(`position fen ${gameFen}\n`);
        let go_command = "";
        switch (engine.go.t) {
            case 'depth':
                go_command = `go depth ${engine.go.c}\n`;
                break;
            case 'nodes':
                go_command = `go nodes ${engine.go.c}\n`;
                break;
            case 'time':
                go_command = `go movetime ${engine.go.c}\n`;
                break;
            default:
                go_command = `go infinite\n`;
                break;
        }
        stdin.write(go_command);

        let analysis = [];
        let bestMove = null;

        for await (const line of rl) {
            if (line.startsWith('info')) {
                const tokens = line.split(' ');
                let depthInfo = { score: null, pv: null };
                tokens.forEach((token, i) => {
                    switch (token) {
                        case 'score':
                            depthInfo.score = tokens[i + 2] === 'mate' ? `mate in ${tokens[i + 3]}` : parseInt(tokens[i + 2]);
                            break;
                        case 'pv':
                            depthInfo.pv = tokens.slice(i + 1).join(' ');
                            break;
                        default:
                            break;
                    }
                });

                if (depthInfo.score != null && depthInfo.pv != null) {
                    analysis.push({ score: depthInfo.score, pv: depthInfo.pv });
                }
            }
            if (line.startsWith('bestmove')) {
                bestMove = line;
                rl.close();
                break;
            }
        }

        //按score排序
        analysis.sort((a, b) => {
            if (typeof a.score === 'number' && typeof b.score === 'number') {
                return b.score - a.score;
            } else {
                return 0; // Handle non-number scores or implement a more complex sorting logic
            }
        });

        // 只返回score最高的5个
        let topFiveAnalysis = analysis.slice(0, 5);
        // Format for display or further processing
        let formattedAnalysis = topFiveAnalysis.map(info => `SCORE CP: ${info.score}\nPV: ${info.pv}`);

        return { analysis: formattedAnalysis, bestMove };
    } catch (error) {
        // 处理异常
        console.error(error);
        throw new Error('Error in UCI');
    }

}