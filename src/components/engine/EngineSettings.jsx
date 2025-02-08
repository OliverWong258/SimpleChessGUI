import { Stack, ScrollArea, Group, Divider, TextInput, SimpleGrid, NumberInput, Checkbox, Button, Modal } from "@mantine/core";
const { ipcRenderer } = require('electron');
import EngineGoMode from "./EngineGoMode";
import PropTypes from 'prop-types';
import { useState } from "react"
import { useToggle } from "@mantine/hooks";
import ConfirmModal from "../common/ConfirmModal";

function EngineSettings({ selected, setSelected, engines }) {
    const [engine, setEngine] = useState(engines[selected]);
    const [goMode, setGoMode] = useState(engine.go);
    const [deleteModal, toggleDeleteModal] = useToggle();
    const [engineName, setEngineName] = useState(engine.name);
    const [engineVersion, setEngineVersion] = useState(engine.version);

    const handleUpdate = (updateEngine) => {
        ipcRenderer.send('save-engine-data', updateEngine);
    };

    const handleDelete = (engine) => {
        ipcRenderer.send('delete-engine-data', engine);
    };

    return (
        <ScrollArea h="100%" offsetScrollbars>
            <Stack>
                <Divider variant="dashed" label="General settings" />
                <Group grow align="start" wrap="nowrap">
                    <Stack>
                        <Group wrap="nowrap" w="100%">
                            <TextInput
                                label="Name"
                                value={engineName}
                                onChange={(e) => {
                                    setEngineName(e.currentTarget.value);
                                    handleUpdate({ ...engine, name: e.currentTarget.value });
                                }
                                }
                            />
                            <TextInput
                                label="Version"
                                w="5rem"
                                value={engineVersion}
                                placeholder="?"
                                onChange={(e) => {
                                    setEngineVersion(e.currentTarget.value);
                                    handleUpdate({ ...engine, version: e.currentTarget.value });
                                }
                                }
                            />
                        </Group>
                    </Stack>
                </Group>
                <Divider variant="dashed" label="Search settings" />
                <EngineGoMode
                    goMode={goMode}
                    setGoMode={(v) => {
                        setGoMode(v);
                        handleUpdate({ ...engine, go: v });
                    }}
                />
                <Divider variant="dashed" label="Advanced settings" />
                <SimpleGrid cols={2}>
                    <NumberInput
                        label={ "Threads"}
                        min={1}
                        max={ 4}
                        value={Number(engine.threads)}
                        onChange={(v) => {
                            setEngine({ ...engine, threads: v });
                            handleUpdate({ ...engine, threads: v });
                        }}
                    />
                    <NumberInput
                        label={"Hash"}
                        min={16}
                        value={Number(engine.hash)}
                        onChange={(v) => {
                            setEngine({ ...engine, hash: v });
                            handleUpdate({ ...engine, hash: v });
                        }}
                    />
                    <NumberInput
                        label={"MultiPV"}
                        min={1}
                        value={Number(engine.multiPV)}
                        onChange={(v) => {
                            setEngine({ ...engine, multiPV: v });
                            handleUpdate({ ...engine, multiPV: v });
                        }}
                    />
                    <NumberInput
                        label={"SkillLevel"}
                        min={1}
                        max={ 20}
                        value={Number(engine.skillLevel)}
                        onChange={(v) => {
                            setEngine({ ...engine, skillLevel: v });
                            handleUpdate({ ...engine, skillLevel: v });
                        }}
                    />
                </SimpleGrid>
                <SimpleGrid cols={2}>
                    <Checkbox
                        label={"Ponder"}
                        checked={engine.ponder}
                        onChange={(e) => {
                            setEngine({ ...engine, ponder: e.currentTarget.checked });
                            handleUpdate({ ...engine, ponder: e.currentTarget.checked });
                        }}
                    />
                </SimpleGrid>
                <Group justify="end">
                    <Button color="red" onClick={() => toggleDeleteModal()}>
                        Remove
                    </Button>
                </Group>
                <ConfirmModal
                    title={"Remove Engine"}
                    description={
                        "Are you sure you want to remove this engine?"
                    }
                    opened={deleteModal}
                    onClose={toggleDeleteModal}
                    onConfirm={() => {
                        setSelected(null);
                        handleDelete(engine);
                        toggleDeleteModal();
                    }}
                    confirmLabel="Remove"
                />
            </Stack>
        </ScrollArea>
    );
}

export default EngineSettings;

EngineSettings.propTypes = {
    selected: PropTypes.number.isRequired,
    setSelected: PropTypes.func.isRequired,
    engines: PropTypes.array.isRequired
};