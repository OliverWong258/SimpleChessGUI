import { ipcMain, dialog } from 'electron';
import { saveDataToFile, getEngineConfig, loadDataFromFile, runUciCommand, deleteEngine } from '../utils/engine.js'
import { saveGame } from '../utils/saveGame.js'
import { readChessFileSync } from '../utils/chessFile.js'

const filters = [[{ name: "Executable Files", extensions: ["exe"] }], [{ name: "FEN Files", extensions: ["fen"] }], [{name: "PGN Files", extensions: ["pgn"]}]];

//打开选择文件弹窗
ipcMain.on('open-file-dialog', (event, type) => {
    let filter = null;
    switch (type) {
        case 'exe':
            filter = filters[0];
            break;
        case 'fen':
            filter = filters[1];
            break;
        case 'pgn':
            filter = filters[2];
            break;
        default:
            console.log("Error in open-file-dialog");
            break;
    }

    dialog.showOpenDialog({
        properties: ['openFile'],
        filters:filter
    }).then(result => {
        event.reply('file-dialog-opened', result.filePaths);
    }).catch(err => {
        console.log(err);
    });
});

//获取引擎信息
ipcMain.on('get-engine-config', async (event, selected) => {
    try {
        const config = await getEngineConfig(selected);
        event.reply('engine-config', config.name);
    } catch (error) {
        console.error(error);
        // 在异常情况下也需要向渲染进程发送消息
        event.reply('engine-config', null);
    }
});

//保存引擎
ipcMain.on('save-engine-data', async (event, engineData) => {
    try {
        saveDataToFile(engineData)        
    } catch (error) {
        console.error(error);
    }
})

//加载引擎
ipcMain.on('load-engine-data', async (event) => {
    try {
        const engines = await loadDataFromFile();
        event.reply('engines', engines);
    } catch (error) {
        console.error(error);
    }
})

//通过uci和引擎交互
ipcMain.on('uci-command', async (event, engine, gameFen) => {
    try {
        let output = await runUciCommand(engine, gameFen);
        event.reply("uci-result", output);
    } catch (error) {
        event.reply("uci-result", "error");
    }
});

//删除引擎
ipcMain.on('delete-engine-data', (event, engine) => {
    try {
        deleteEngine(engine);
    } catch (error) {
        console.error(error);
    }
})

// 打开选择文件夹弹窗
ipcMain.on('open-folder', (event) => {
    dialog.showOpenDialog({
        properties: ['openDirectory']  // 修改此处为 openDirectory
    }).then(result => {
        event.reply('folder-opened', result.filePaths);
    }).catch(err => {
        console.log(err);
    });
});

// 保存棋局
ipcMain.on('save-game', (event, pgn, fen, folderPath, pgnFile, fenFile) => {
    try {
        saveGame(pgn, fen, folderPath, pgnFile, fenFile);
    } catch (error) {
        console.error(error);
    }
})

// 读取.fen文件
ipcMain.on('read-fen', (event, selected) => {
    try {
        let position = readChessFileSync(selected);
        event.reply('fen-opened', position);
    } catch (error) {
        console.error(error);
    }
})

// 读取.pgn文件
ipcMain.on('read-pgn', (event, selected) => {
    try {
        let position = readChessFileSync(selected);
        event.reply('pgn-opened', position);
    } catch (error) {
        console.error(error);
    }
})