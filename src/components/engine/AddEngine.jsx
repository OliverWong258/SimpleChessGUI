import {
    Modal,
    Tabs,
} from "@mantine/core";
import PropTypes from 'prop-types';
import EngineForm from './EngineForm'

function AddEngine({
    opened,
    setOpened
}) {
    return (
        <Modal opened={opened} onClose={() => setOpened(false)} title="Add Engine">
            <Tabs defaultValue="local">
                <Tabs.List>
                    <Tabs.Tab value="local">Local</Tabs.Tab>
                </Tabs.List>
                <Tabs.Panel value="local" pt="xs">
                    <EngineForm
                        submitLabel="Add"
                        setOpened={setOpened}
                    />
                </Tabs.Panel>
            </Tabs>
        </Modal>
    );
}

AddEngine.propTypes = {
    opened: PropTypes.bool.isRequired, 
    setOpened: PropTypes.func.isRequired 
};

export default AddEngine;