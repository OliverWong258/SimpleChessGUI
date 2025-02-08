import ChessGame from '../playChess/PlayChess';
import styles from './Board.module.css';
import { useState, useEffect } from 'react';
import { Stack, Paper, ScrollArea, Group, Text, Box, Button, Divider } from "@mantine/core";
import { OpponentForm } from './OpponentForm';
import SaveModal from '../common/SaveModal';
import LoadModal from '../common/LoadModal';

function Board() {
    //const [isPlaying, setIsPlaying] = useState(false);
    const [gameState, setGameState] = useState('settingUp');
    const [player1Settings, setPlayer1Settings] = useState ({
        type: "human",
        name: "Player",
    });
    const [player2Settings, setPlayer2Settings] = useState ({
        type: "human",
        name: "Player",
    });
    const [player1GameHistory, setPlayer1GameHistory] = useState([]);
    const [player2GameHistory, setPlayer2GameHistory] = useState([]);
    const [gameAnalysis, setGameAnalysis] = useState([]);
    const [analysis, setAnalysis] = useState(false);
    const [save, setSave] = useState(false);
    const [load, setLoad] = useState(false);
    const [opened, setOpened] = useState(false);
    const [folderPath, setFolderPath] = useState("./");
    const [pgnFile, setPGNFile] = useState("chessGame.pgn");
    const [fenFile, setFENFile] = useState("chessGame.fen");
    const [openFile, setOpenFile] = useState(false);
    const [position, setPosition] = useState('start');

    //记录棋手走法
    const handleMove = (move, player) => {
        if(player==1)
            setPlayer1GameHistory(prev => [...prev, move]);
        else
            setPlayer2GameHistory(prev => [...prev, move]);
    };

    
    const handleAnalysis = (analysis) => {
        setGameAnalysis(analysis);
    };

    //开始下棋
    function startGame() {
        setGameState('playing');
    }

    //重置棋局
    function resetGame() {
        setPosition('start');
        setGameState('reset');
        setAnalysis(false);
        setPlayer1GameHistory([]);
        setPlayer2GameHistory([]);
    }

    //保存棋局
    function saveGame() {
        setOpened(true);
    }

    //加载棋局
    function loadFile() {
        setOpenFile(true);
    }

    //显示局势分析
    function showAnalysis() {
        setAnalysis(true);
    }

    //隐藏局势分析
    function showInfo() {
        setAnalysis(false);
    }


    return (
        <div>
            <SaveModal opened={opened} setOpened={setOpened} folderPath={folderPath}
                setFolderPath={setFolderPath} pgnFile={pgnFile} setPGNFile={setPGNFile} fenFile={fenFile} setFENFile={setFENFile} setSave={setSave} />
            <LoadModal
                openFile={openFile}
                setOpenFile={setOpenFile}
                setPosition={setPosition}
                setGameState={setGameState}
                setLoad={ setLoad}
            />
            <div className={styles.leftHalf}>
                <Paper  p="md" h="100%" w="100%">
                    <ChessGame
                        gameState={gameState}
                        setGameState={setGameState}
                        player1Settings={player1Settings}
                        player2Settings={player2Settings}
                        onMove={handleMove}
                        onAnalysis={handleAnalysis}
                        save={save}
                        setSave={setSave}
                        load={load}
                        setLoad={setLoad}
                        folderPath={folderPath}
                        pgnFile={pgnFile}
                        fenFile={fenFile}
                        position={position}
                        setPosition={setPosition}
                    />
                </Paper>
            </div>
            <div className={styles.topRight}>
                <Stack h="100%" w="100%">
                    <Paper withBorder p="md" h="90%" w="100%">
                        <ScrollArea h="100%" offsetScrollbars>
                            <Stack h="100%">
                                <Group>
                                    <Text flex={1} ta="center" fz="lg" fw="bold">
                                        {"White"}
                                    </Text>
                                    <Text flex={1} ta="center" fz="lg" fw="bold">
                                        {"Black"}
                                    </Text>
                                </Group>
                                <Box>
                                    <Group style={{ alignItems: "start" }}>
                                        <OpponentForm
                                            opponent={player1Settings}
                                            setOpponent={setPlayer1Settings}
                                            gameState={gameState}
                                            gameHistory={player1GameHistory}
                                        />
                                        <Divider orientation="vertical" />
                                        <OpponentForm
                                            opponent={player2Settings}
                                            setOpponent={setPlayer2Settings}
                                            gameState={gameState}
                                            gameHistory={player2GameHistory}
                                        />
                                    </Group>
                                </Box>
                            </Stack>
                        </ScrollArea>
                    </Paper>
                    <Group>
                        {gameState === "settingUp" && (
                            <Group>
                                <Button onClick={startGame}>
                                    Start Game
                                </Button>
                                <Button onClick={loadFile}>
                                    Load File
                                </Button>
                            </Group>
                        )}
                        {gameState !== "settingUp" && (
                            <Button onClick={saveGame}>
                                Save Game
                            </Button>
                        )}
                        <Button onClick={resetGame}>
                            Reset Game
                        </Button>
                    </Group>
                </Stack>
            </div>
            <div className={styles.buttomRight}>
                <Stack h="100%">
                    <Paper withBorder p="md" h="90%" w="100%">
                        <ScrollArea h="100%" offsetScrollbars>
                            <h3>Analysis</h3>
                            {gameState === "playing" && analysis && (
                                <ol>
                                    {gameAnalysis.map((item, index) => (
                                        <li key={index}>
                                            <pre>{item}</pre>
                                        </li>
                                    ))}
                                </ol>
                            )}
                        </ScrollArea>
                    </Paper>
                    <Group>
                        {gameState === "playing" && !analysis && (
                            <Button onClick={showAnalysis}>
                                Show Analysis
                            </Button>
                        )}
                        {gameState === "playing" && analysis && (
                            <Button onClick={showInfo}>
                                Hide Analysis
                            </Button>
                        )}
                    </Group>
                </Stack>
            </div>
        </div>
    );
}

export default Board;
