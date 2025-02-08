import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import PropTypes from 'prop-types';

//È·ÈÏÒÆ³ýÒýÇæ
function ConfirmModal({
  title,
  description,
  opened,
  onClose,
  onConfirm,
  confirmLabel,
}) {
  return (
    <Modal withCloseButton={false} opened={opened} onClose={onClose}>
      <Stack>
        <div>
          <Text fz="lg" fw="bold" mb={10}>
            {title}
          </Text>
          <Text>{description}</Text>
          <Text>This action cannot be undone.</Text>
        </div>

        <Group justify="right">
          <Button variant="default" onClick={() => onClose()}>
            Cancel
          </Button>
          <Button color="red" onClick={() => onConfirm()}>
            {confirmLabel || "Delete"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default ConfirmModal;

ConfirmModal.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    opened: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    confirmLabel: PropTypes.string.isRequired,
};