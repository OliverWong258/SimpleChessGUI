import fs from 'fs';
import { spawn } from 'child_process';
import readline from 'readline';

//��������
export function saveDataToFile(engineData) {
    const filePath = './engine/engine.json';

    // ��ȡJSON�ļ�
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('��ȡ�ļ�ʱ����', err);
            return;
        }
        
        // ��JSON�ַ�������ΪJavaScript����
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

        // ���޸ĺ������ת����JSON�ַ���
        const updatedData = JSON.stringify(jsonData, null, 2);

        // д���ļ�
        fs.writeFile(filePath, updatedData, 'utf8', (err) => {
            if (err) {
                console.error('д���ļ�ʱ����', err);
                return;
            }
        });
    });
}

//ɾ������
export function deleteEngine(engine) {
    const filePath = './engine/engine.json';

    // ��ȡJSON�ļ�
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('��ȡ�ļ�ʱ����', err);
            return;
        }

        // ��JSON�ַ�������ΪJavaScript����
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

        // ���޸ĺ������ת����JSON�ַ���
        const updatedData = JSON.stringify(jsonData, null, 2);

        // д���ļ�
        fs.writeFile(filePath, updatedData, 'utf8', (err) => {
            if (err) {
                console.error('д���ļ�ʱ����', err);
                return;
            }
        });
    });
}

//��������
export async function loadDataFromFile() {
    const filePath = './engine/engine.json';

    // ����һ��Promise�����԰�װ�첽����
    return new Promise((resolve, reject) => {
        // ��ȡJSON�ļ�
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) {
                console.error('��ȡ�ļ�ʱ����', err);
                reject(err); // ���������Promise״̬����Ϊrejected
                return;
            }
            // ��JSON�ַ�������ΪJavaScript����
            const jsonData = data ? JSON.parse(data) : [];
            resolve(jsonData); // ����ȡ��������ΪPromise�Ľ������
        });
    });
}

async function startEngine(file_path) {
    let command = spawn(file_path, [], {
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true  // ���ش��ڣ����� Windows ƽ̨��Ч��
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

//��ȡ������Ϣ
export async function getEngineConfig(path) {
    try {
        let child = await startEngine(path);
        let [stdin, rl] = await getHandles(child);
        stdin.write('uci\n');

        let config = { name: '', options: [] };

        for await (const line of rl) {
            // ���� line ������ config ���������
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
        // �����쳣
        console.error(error);
        throw new Error('Failed to get engine config');
    }
}

//uci����
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

        //��score����
        analysis.sort((a, b) => {
            if (typeof a.score === 'number' && typeof b.score === 'number') {
                return b.score - a.score;
            } else {
                return 0; // Handle non-number scores or implement a more complex sorting logic
            }
        });

        // ֻ����score��ߵ�5��
        let topFiveAnalysis = analysis.slice(0, 5);
        // Format for display or further processing
        let formattedAnalysis = topFiveAnalysis.map(info => `SCORE CP: ${info.score}\nPV: ${info.pv}`);

        return { analysis: formattedAnalysis, bestMove };
    } catch (error) {
        // �����쳣
        console.error(error);
        throw new Error('Error in UCI');
    }

}