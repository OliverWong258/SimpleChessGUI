import {
    Modal,
    Input,
    Text,
    Button,
    Tabs
} from "@mantine/core";
import PropTypes from 'prop-types';
const { ipcRenderer } = require('electron');
import { useState } from 'react';
import { Chess } from 'chess.js';

//加载棋局文件
function LoadModal({
    openFile,
    setOpenFile,
    setPosition,
    setLoad
}) {
    const [tmpPos, setTmpPos] = useState(' ');
    const [fenFilePath, setFENFilePath] = useState("");
    const [pgnFilePath, setPGNFilePath] = useState("");

    const handleSubmit = () => {
        if (tmpPos == ' ') return;
        if (!checkFEN(tmpPos)) {
            alert("Invalid File");
            return;
        }
        setPosition(tmpPos);
        setTmpPos(' ');
        setOpenFile(false);
        setFENFilePath("");
        setPGNFilePath("");
        setLoad(true);
    };

    return (
        <Modal opened={openFile} onClose={() => setOpenFile(false)} title="Load File">
            <Tabs defaultValue="fen">
                <Tabs.List>
                    <Tabs.Tab value="fen">FEN</Tabs.Tab>
                    <Tabs.Tab value="pgn">PGN</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="fen" pt="xs">
                    <Input.Wrapper
                        withAsterisk={true}
                        label="FEN File"
                        description="Click"
                    >
                        <Input
                            component="button"
                            type="button"
                            onClick={async () => {
                                ipcRenderer.send('open-file-dialog', "fen");

                                // 监听主进程发送的消息，获取文件路径
                                ipcRenderer.once('file-dialog-opened', (event, filePaths) => {
                                    if (filePaths[0] == undefined) return;
                                    const selected = filePaths[0];
                                    setFENFilePath(selected);
                                    ipcRenderer.send('read-fen', selected);
                                    ipcRenderer.once('fen-opened', (event, result) => {
                                        setTmpPos(result);
                                    })
                                });
                            }}
                        >
                            <Text lineClamp={1}>{fenFilePath}</Text>
                        </Input>
                    </Input.Wrapper>
                    <Button fullWidth mt="xl" type="submit" onClick={handleSubmit}>
                        Load FEN
                    </Button>
                </Tabs.Panel>
                <Tabs.Panel value="pgn" pt="xs">
                    <Input.Wrapper
                        withAsterisk={true}
                        label="PGN File"
                        description="Click"
                    >
                        <Input
                            component="button"
                            type="button"
                            onClick={async () => {
                                ipcRenderer.send('open-file-dialog', "pgn");

                                // 监听主进程发送的消息，获取文件路径
                                ipcRenderer.once('file-dialog-opened', (event, filePaths) => {
                                    if (filePaths[0] == undefined) return;
                                    const selected = filePaths[0];
                                    setPGNFilePath(selected);
                                    ipcRenderer.send('read-pgn', selected);
                                    ipcRenderer.once('pgn-opened', (event, result) => {
                                        setTmpPos(loadPgnAndPrintFen(result));
                                    })
                                });
                            }}
                        >
                            <Text lineClamp={1}>{pgnFilePath}</Text>
                        </Input>
                    </Input.Wrapper>
                    <Button fullWidth mt="xl" type="submit" onClick={handleSubmit}>
                        Load PGN
                    </Button>
                </Tabs.Panel>
            </Tabs>
        </Modal>
    );
}

LoadModal.propTypes = {
    openFile: PropTypes.bool.isRequired, 
    setOpenFile: PropTypes.func.isRequired, 
    setPosition: PropTypes.func.isRequired,
    setLoad: PropTypes.func.isRequired
};

export default LoadModal;

const chess = new Chess();

function loadPgnAndPrintFen(pgn) {
    // 清空当前棋局
    chess.reset();
    chess.loadPgn(pgn);
    return chess.fen();
}

function checkFEN(fen) {
    try {
        chess.load(fen);
    } catch (e) {
        //console.log(e)
        return false;
    }
    return true;
}