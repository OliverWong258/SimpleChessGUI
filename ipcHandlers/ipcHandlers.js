import { ipcMain, dialog } from 'electron';
import { saveDataToFile, getEngineConfig, loadDataFromFile, runUciCommand, deleteEngine } from '../utils/engine.js'
import { saveGame } from '../utils/saveGame.js'
import { readChessFileSync } from '../utils/chessFile.js'

const filters = [[{ name: "Executable Files", extensions: ["exe"] }], [{ name: "FEN Files", extensions: ["fen"] }], [{name: "PGN Files", extensions: ["pgn"]}]];

//��ѡ���ļ�����
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

//��ȡ������Ϣ
ipcMain.on('get-engine-config', async (event, selected) => {
    try {
        const config = await getEngineConfig(selected);
        event.reply('engine-config', config.name);
    } catch (error) {
        console.error(error);
        // ���쳣�����Ҳ��Ҫ����Ⱦ���̷�����Ϣ
        event.reply('engine-config', null);
    }
});

//��������
ipcMain.on('save-engine-data', async (event, engineData) => {
    try {
        saveDataToFile(engineData)        
    } catch (error) {
        console.error(error);
    }
})

//��������
ipcMain.on('load-engine-data', async (event) => {
    try {
        const engines = await loadDataFromFile();
        event.reply('engines', engines);
    } catch (error) {
        console.error(error);
    }
})

//ͨ��uci�����潻��
ipcMain.on('uci-command', async (event, engine, gameFen) => {
    try {
        let output = await runUciCommand(engine, gameFen);
        event.reply("uci-result", output);
    } catch (error) {
        event.reply("uci-result", "error");
    }
});

//ɾ������
ipcMain.on('delete-engine-data', (event, engine) => {
    try {
        deleteEngine(engine);
    } catch (error) {
        console.error(error);
    }
})

// ��ѡ���ļ��е���
ipcMain.on('open-folder', (event) => {
    dialog.showOpenDialog({
        properties: ['openDirectory']  // �޸Ĵ˴�Ϊ openDirectory
    }).then(result => {
        event.reply('folder-opened', result.filePaths);
    }).catch(err => {
        console.log(err);
    });
});

// �������
ipcMain.on('save-game', (event, pgn, fen, folderPath, pgnFile, fenFile) => {
    try {
        saveGame(pgn, fen, folderPath, pgnFile, fenFile);
    } catch (error) {
        console.error(error);
    }
})

// ��ȡ.fen�ļ�
ipcMain.on('read-fen', (event, selected) => {
    try {
        let position = readChessFileSync(selected);
        event.reply('fen-opened', position);
    } catch (error) {
        console.error(error);
    }
})

// ��ȡ.pgn�ļ�
ipcMain.on('read-pgn', (event, selected) => {
    try {
        let position = readChessFileSync(selected);
        event.reply('pgn-opened', position);
    } catch (error) {
        console.error(error);
    }
})