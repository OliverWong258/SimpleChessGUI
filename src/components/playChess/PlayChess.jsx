import { useState, useCallback, useEffect } from 'react';
import { Chessboard } from 'react-chessboard'; // ʹ����������
import { Chess } from 'chess.js';
import PropTypes from 'prop-types';
const { ipcRenderer } = require('electron');
import { sleep } from '../../../utils/sleep.js'

export function ChessGame({ gameState, setGameState, player1Settings, player2Settings, onMove, onAnalysis, save, setSave, load, setLoad, folderPath, pgnFile, fenFile, position, setPosition}) {
    const [game] = useState(new Chess());
    const [turn, setTurn] = useState('w');
    const [squareStyles, setSquareStyles] = useState({});
    const [firstDrop, setFirstDrop] = useState(false);

    useEffect(() => {
        if (save) {
            let pgn = game.pgn({
                max_width: 20, 
                newline_char: '\n' 
            });
            let fen = game.fen();
            ipcRenderer.send("save-game", pgn, fen, folderPath, pgnFile, fenFile);
            setSave(false);
        }
    }, [save, setSave, game, folderPath, pgnFile, fenFile])

    useEffect(() => {
        if (load) {
            game.load(position);
            setLoad(false);
        }
    }, [load, setLoad, game, position])


    //�Զ�����
    const autoEngineMove = useCallback(async (currentTurn, initial) => {
        await sleep(500);

        const engine = currentTurn === 'w' ? player1Settings.engine : player2Settings.engine;
        //const go = currentTurn === 'w' ? player1Settings.engine.go : player2Settings.engine.go;
        const currentFen = game.fen();
        if (!initial && currentFen == "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
            return;

        ipcRenderer.removeAllListeners('uci-result')
        ipcRenderer.send('uci-command', engine, currentFen);
        ipcRenderer.once('uci-result', (event, result) => {
            //console.log(ipcRenderer.listenerCount('uci-result'));
            if (result == "error") {
                alert("Please check your chess engine");
                return;
            }
            onAnalysis(result.analysis);
            const bestMove = result.bestMove.substring(9, 13); // �������ʵ�������ʽ����
            let player = currentTurn == 'w' ? 1 : 2;
            onMove(bestMove, player);

            try {
                game.move({
                    from: bestMove.substring(0, 2),
                    to: bestMove.substring(2, 4),
                    promotion: 'q'
                });
                setPosition(game.fen());
                setTurn(game.turn());
            } catch (error) {
                //console.log(`Error in autoEngineMove: ${error}`);
            }

            if (game.isGameOver()) { // �����Ϸ�Ƿ����
                alert(`${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate!`);
                setGameState("gameOver");
                return;
            }
        });
    }, [game, player1Settings, player2Settings, onMove, setPosition, setGameState, onAnalysis]);


    const triggerEngineMove = useCallback((player) => {
        const engine = player == 1 ? player1Settings.engine : player2Settings.engine;
        //const go = player == 1 ? player1Settings.engine.go : player2Settings.engine.go;
        // �ӵ�ǰ����л�ȡ FEN �ַ���
        const currentFen = game.fen();
        ipcRenderer.send('uci-command', engine, currentFen);
        ipcRenderer.once('uci-result', (event, result) => {
            if (result == "error") {
                alert("Please check your chess engine");
                return;
            }

            onAnalysis(result.analysis);
            const bestMove = result.bestMove.substring(9, 13); // ����Ľ���ȡ���ڷ��ؽ����ȷ�и�ʽ
            onMove(bestMove, player)

            try {
                game.move({
                    from: bestMove.substring(0, 2),
                    to: bestMove.substring(2, 4),
                    promotion: 'q', // �������Ϊ��
                });
                setPosition(game.fen());
                setTurn(game.turn());
            } catch (error) {
                //console.log(`Error in triggerEngineMove: ${error}`);
            }

            if (game.isGameOver()) { // �����Ϸ�Ƿ����
                alert(`${game.turn() === 'w' ? 'Black' : 'White'} wins by checkmate!`);
                setGameState("gameOver");
                return;
            }
        });
        //����
        return () => {
            ipcRenderer.removeAllListeners('uci-result');
        };
    }, [game, player1Settings, player2Settings, onMove, setPosition, setGameState, onAnalysis]);

    //����Ƿ�˫��player��������
    useEffect(() => {
        if (gameState == "playing" && player1Settings.type === "engine" && player2Settings.type === "engine") {
            if (!firstDrop) {
                setFirstDrop(true);
                autoEngineMove(turn, true);
            }
            else
                autoEngineMove(turn, false);
        }

    }, [gameState, player1Settings, player2Settings, autoEngineMove, turn, setGameState, firstDrop])



    useEffect(() => {
        // ����Ƿ���������
        if (gameState === "playing" && player1Settings.type === "engine" && turn === 'w' && player2Settings.type === "human" && !firstDrop) {
            setFirstDrop(true);
            triggerEngineMove(1);
        }
    }, [gameState, player1Settings, turn, player2Settings, firstDrop, triggerEngineMove]);

    // �������
    useEffect(() => {
        if (gameState === "reset") {
            // ��Ϸ���ٽ���ʱ�������
            game.reset();
            setTurn('w');
            setSquareStyles({});
            setFirstDrop(false);
            setGameState("settingUp");
            ipcRenderer.removeAllListeners('uci-result');
        }
    }, [gameState, game, setPosition, setGameState]); // �����б������ isPlaying

    const onDrop = useCallback(
        (sourceSquare, targetSquare, piece) => {
            try {
                let player = piece[0] == 'w' ? 1 : 2;
                onMove(sourceSquare + targetSquare, player);
                const move = game.move({
                    from: sourceSquare,
                    to: targetSquare,
                    promotion: 'q'
                });
                if (!move) return false;
                setPosition(game.fen());
                let newTurn = game.turn();
                setTurn(newTurn);

                if (game.isCheckmate()) {
                    setGameState("gameOver");
                    alert(`${newTurn === 'w' ? 'Black' : 'White'} wins by checkmate!`);
                } else {
                    // ����û�������ֵ�����
                    if (player1Settings.type === "human" && player2Settings.type === "engine" && newTurn === 'b') {
                        triggerEngineMove(2);
                    }
                    else if ((player2Settings.type === "human" && player1Settings.type === "engine" && newTurn === 'w')) {
                        triggerEngineMove(1);
                    }
                }
                return true;
            } catch (error) {
                //console.error('Error making move:', error);
                return false;
            }
        },
        [game, triggerEngineMove, player1Settings, player2Settings, onMove, setPosition, setGameState]
    );

    const onMouseOverSquare = useCallback(
        (square) => {
            const moves = game.moves({
                square: square,
                verbose: true,
            });

            if (moves.length === 0) {
                setSquareStyles({});
                return;
            }

            const newSquareStyles = {};
            moves.forEach((move) => {
                newSquareStyles[move.to] = {
                    background:
                        game.get(move.to) &&
                            game.get(move.to).color !== game.get(square).color
                            ? 'radial-gradient(circle, red 36%, transparent 40%)'
                            : 'radial-gradient(circle, grey 36%, transparent 40%)',
                    borderRadius: '50%',
                };
            });

            setSquareStyles(newSquareStyles);
        },
        [game]
    );

    const onMouseOutSquare = useCallback(() => setSquareStyles({}), []);

    const pieceDraggable = useCallback(
        ({ piece, sourceSquare }) => {
            if (
                game.isGameOver() ||
                game.turn() != game.get(sourceSquare).color ||
                (player1Settings.type == "engine" && piece[0] == 'w') ||
                (player2Settings.type == "engine" && piece[0] == 'b')
            ) {
                return false;
            }
            else {
                return true;
            }
        },
        [game, player1Settings, player2Settings]
    );

    return (
        <div style={{ width: '100%', height: '100%', margin: '0 auto' }}> {/* ȷ�������гߴ� */}
            <Chessboard
                arePiecesDraggable={gameState == "playing"}
                position={position}
                onPieceDrop={onDrop}
                onMouseOverSquare={onMouseOverSquare}
                onMouseOutSquare={onMouseOutSquare}
                customSquareStyles={squareStyles}
                isDraggablePiece={pieceDraggable}
            />
        </div>
    );
}

ChessGame.propTypes = {
    gameState: PropTypes.string.isRequired,
    setGameState: PropTypes.func.isRequired,
    player1Settings: PropTypes.object.isRequired,
    player2Settings: PropTypes.object.isRequired,
    onMove: PropTypes.func.isRequired,
    onAnalysis: PropTypes.func.isRequired,
    save: PropTypes.bool.isRequired,
    setSave: PropTypes.func.isRequired,
    load: PropTypes.bool.isRequired,
    setLoad: PropTypes.func.isRequired,
    folderPath: PropTypes.string.isRequired,
    pgnFile: PropTypes.string.isRequired,
    fenFile: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    setPosition: PropTypes.func.isRequired,
};


export default ChessGame;
