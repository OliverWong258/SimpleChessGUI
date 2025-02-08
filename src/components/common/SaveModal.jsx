import {
    Modal,
    Input,
    Text,
    Button,
    TextInput
} from "@mantine/core";
import PropTypes from 'prop-types';
const { ipcRenderer } = require('electron');

function SaveModal({
    opened,
    setOpened,
    folderPath,
    setFolderPath,
    pgnFile,
    setPGNFile,
    fenFile,
    setFENFile,
    setSave
}) {
    const handleSubmit = () => {
        setOpened(false);
        setSave(true);
    };

    return (
        <Modal opened={opened} onClose={() => setOpened(false)} title="Save Game">
                    <Input.Wrapper
                        withAsterisk={true}
                        label="Folder Path"
                        description="Click"
                    >
                        <Input
                            component="button"
                            type="button"
                            onClick={async () => {
                                ipcRenderer.send('open-folder');

                                // 监听主进程发送的消息，获取文件路径
                                ipcRenderer.once('folder-opened', (event, filePaths) => {
                                    const selected = filePaths[0];
                                    setFolderPath(selected);
                                });
                            }}
                        >
                            <Text lineClamp={1}>{folderPath}</Text>
                        </Input>
                    </Input.Wrapper>
                    <TextInput
                        label="PGN File"
                        placeholder=".pgn"
                        withAsterisk
                        value={pgnFile}
                        onChange={(event) => {
                            setPGNFile(event.target.value);
                        }}
                    />
                    <TextInput
                        label="FEN File"
                        withAsterisk
                        placeholder=".fen"
                        value={fenFile}
                        onChange={(event) => {
                            setFENFile(event.target.value);
                        }}
                    />
                    <Button fullWidth mt="xl" type="submit" onClick={handleSubmit}>
                        Save
                    </Button>
        </Modal>
    );
}

SaveModal.propTypes = {
    opened: PropTypes.bool.isRequired, 
    setOpened: PropTypes.func.isRequired,
    folderPath: PropTypes.string.isRequired,
    setFolderPath: PropTypes.func.isRequired,
    pgnFile: PropTypes.string.isRequired,
    setPGNFile: PropTypes.func.isRequired,
    fenFile: PropTypes.string.isRequired,
    setFENFile: PropTypes.func.isRequired,
    setSave: PropTypes.func.isRequired
};

export default SaveModal;