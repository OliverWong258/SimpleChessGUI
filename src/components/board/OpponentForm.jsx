import { Stack, SegmentedControl, TextInput, Select, Text } from "@mantine/core";
const { ipcRenderer } = require('electron');
import { useEffect, Suspense, useState } from "react"
import PropTypes from 'prop-types';

function EnginesSelect({
    engine,
    setEngine,
}) {
    const [engines, setEngines] = useState([]);

    //加载列表中所有的引擎
    useEffect(() => {
        ipcRenderer.send('load-engine-data');

        const handleEngines = (event, engines) => {
            setEngines(engines);
        };

        ipcRenderer.on('engines', handleEngines);

        return () => {
            ipcRenderer.removeListener('engines', handleEngines);
        };
    }, []);

    //默认将选框设置为列表中的第一个引擎
    useEffect(() => {
        if (engines.length > 0 && engine === null) {
            setEngine(engines[0]);
        }
    }, [engine, engines, setEngine]);

    return (
        <Suspense>
            <Select
                label="Engine"
                allowDeselect={false}
                data={engines?.map((engine) => ({
                    label: engine.name,
                    value: engine.path,
                }))}
                value={engine?.path ?? ""}
                onChange={(e) => {
                    setEngine(engines.find((engine) => engine.path === e) ?? null);
                }}
            />
        </Suspense>
    );
}

EnginesSelect.propTypes = {
    engine: PropTypes.shape({
        // 定义engine属性应该是一个JSON对象，包含name和path属性
        name: PropTypes.string.isRequired,
        path: PropTypes.string.isRequired,
    }),
    setEngine: PropTypes.func.isRequired, // setEngine属性应该是一个函数
};

export function OpponentForm({
    opponent,
    setOpponent,
    gameState,
    gameHistory,
}) {

    //更新棋手设置
    function updateType(type) {
        if (type === "human") {
            setOpponent((prev) => ({
                ...prev,
                type: "human",
                name: "Player",
            }));
        } else {
            setOpponent((prev) => ({
                ...prev,
                type: "engine",
                name: null,
                engine:null,
            }));
        }
    }

    return (
        <Stack flex={1} h="100%">
            {gameState == "settingUp" && (
                <Stack flex={1}>
                    <SegmentedControl
                        data={[
                            { value: "human", label: "Human" },
                            { value: "engine", label: "Engine" },
                        ]}
                        value={opponent.type}
                        onChange={(v) => updateType(v)}
                    />

                    {opponent.type === "human" && (
                        <TextInput
                            label="Name"
                            value={opponent.name ?? ""}
                            onChange={(e) =>
                                setOpponent((prev) => ({ ...prev, name: e.target.value }))
                            }
                        />
                    )}
                    {opponent.type === "engine" && (
                        <EnginesSelect
                            engine={opponent.engine}
                            setEngine={(engine) => {
                                setOpponent((prev) => ({ ...prev, engine }))
                            }}
                        />
                    )}
                </Stack>
            )}
            {gameState != "settingUp" && (
                <Stack>
                    <Text ta="center">{opponent.name ?? "engine"} Move History</Text>
                    {gameHistory.map((move, index) => (
                        <li key={index}>
                            {move}
                        </li>
                    ))}
                </Stack>
            )}
        </Stack>
    );
}

OpponentForm.propTypes = {
    opponent: PropTypes.object.isRequired,
    setOpponent: PropTypes.func.isRequired,
    gameState: PropTypes.string.isRequired,
    gameHistory: PropTypes.array.isRequired
};