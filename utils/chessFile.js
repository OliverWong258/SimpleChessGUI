import fs from 'fs';
import path from 'path'

export function readChessFileSync(filePath) {
    // 确保文件路径是绝对的
    const absolutePath = path.resolve(filePath);

    try {
        // 使用 readFileSync 同步读取文件内容
        const data = fs.readFileSync(absolutePath, 'utf8');
        return data.trim();  // 返回内容，并移除任何额外的空格或换行
    } catch (err) {
        throw new Error('Error reading the file: ' + err.message);
    }
}