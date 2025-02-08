import fs from 'fs'
import path from 'path'

export function saveGame(pgn, fen, folderPath, pgnFile, fenFile) {

    let pgnFilePath = path.join(folderPath, pgnFile);
    let fenFilePath = path.join(folderPath, fenFile);

    //写入PGN文件
    fs.writeFile(pgnFilePath, pgn, (err) => {
        if (err) {
            console.error('Failed to save PGN file:', err);
        } else {
            console.log('PGN file saved successfully!');
        }
    });

    // 写入 FEN 文件
    fs.writeFile(fenFilePath, fen, (err) => {
        if (err) {
            console.error('Failed to save FEN file:', err);
        } else {
            console.log('FEN file saved successfully!');
        }
    });
} 