import fs from 'fs';
import path from 'path'

export function readChessFileSync(filePath) {
    // ȷ���ļ�·���Ǿ��Ե�
    const absolutePath = path.resolve(filePath);

    try {
        // ʹ�� readFileSync ͬ����ȡ�ļ�����
        const data = fs.readFileSync(absolutePath, 'utf8');
        return data.trim();  // �������ݣ����Ƴ��κζ���Ŀո����
    } catch (err) {
        throw new Error('Error reading the file: ' + err.message);
    }
}