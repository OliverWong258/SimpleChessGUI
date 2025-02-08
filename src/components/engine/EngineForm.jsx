import { Button, Input, NumberInput, Text, TextInput } from "@mantine/core";
const { ipcRenderer } = require('electron');
import PropTypes from 'prop-types';
import { useState } from 'react';

export default function EngineForm({ submitLabel, setOpened }) {
    const [selectedFile, setSelectedFile] = useState('');
    const [engineName, setEngineName] = useState('');
    const handleSubmit = () => {
        if (engineName == '' || selectedFile == '') return;
        const engineData = { "path": selectedFile, "name": engineName, "go": { "t": "depth", "c": 20 } };
        ipcRenderer.send('save-engine-data', engineData);
        setOpened(false);
    };
    const handleEngineNameChange = (event) => {
        setEngineName(event.target.value);
    };

    return (
        <div>
            <Input.Wrapper
                withAsterisk={true}
                label="Engine File"
                description="Click"
            >
                <Input
                    component="button"
                    type="button"
                    onClick={async () => {
                        ipcRenderer.send('open-file-dialog', "exe");

                        // 监听主进程发送的消息，获取文件路径
                        ipcRenderer.once('file-dialog-opened', (event, filePaths) => {
                            const selected = filePaths[0];
                            if (!selected) return;
                            ipcRenderer.send('get-engine-config', selected);

                            ipcRenderer.once('engine-config', (event, name) => {
                                setSelectedFile(selected);
                                setEngineName(name);
                            });
                        });
                    }}
                >
                    <Text lineClamp={1}>{selectedFile}</Text>
                </Input>
            </Input.Wrapper>

            <TextInput
                label="Name"
                placeholder="Autodetect"
                withAsterisk
                value={engineName}
                onChange={handleEngineNameChange}
            />

            <NumberInput
                label="Elo"
                placeholder="Engine's Elo"
                //{...form.getInputProps("elo")}
            />

            <Button fullWidth mt="xl" type="submit" onClick={handleSubmit}>
                {submitLabel}
            </Button>
        </div>
    )
}

EngineForm.propTypes = {
    submitLabel: PropTypes.string.isRequired,
    setOpened: PropTypes.func.isRequired
};