'use client';

import DeleteIcon from '@metabuilder/components/fakemui/Delete';
import SpeedIcon from '@metabuilder/components/fakemui/Speed';
import {
  Chip, IconButton, List, ListItem,
  ListItemIcon, ListItemText, Paper, Tooltip, Typography,
} from '@metabuilder/components/fakemui';
import s from './index-list.module.scss';

type IndexEntry = {
  index_name: string;
  is_primary: boolean;
  is_unique: boolean;
  index_type: string;
  columns: string[];
};

type IndexListProps = {
  tableName: string;
  indexes: IndexEntry[];
  onDeleteIndex: (indexName: string) => void;
};

function IndexChips(
  { is_primary, is_unique, index_type }:
    Pick<IndexEntry, 'is_primary' | 'is_unique' | 'index_type'>,
) {
  return (
    <>
      {is_primary && (
        <Chip label="PRIMARY KEY" size="small" color="primary" />
      )}
      {is_unique && !is_primary && (
        <Chip label="UNIQUE" size="small" color="secondary" />
      )}
      <Chip label={index_type.toUpperCase()} size="small" />
    </>
  );
}

export default function IndexList({
  tableName, indexes, onDeleteIndex,
}: IndexListProps) {
  return (
    <Paper className={s.paper}>
      <Typography variant="h6" gutterBottom>
        Indexes on {tableName}
      </Typography>
      <List>
        {indexes.map(index => (
          <ListItem
            key={index.index_name}
            secondaryAction={
              index.is_primary ? (
                <Tooltip title="Primary key indexes are managed automatically and cannot be dropped">
                  <span>
                    <IconButton edge="end" disabled>
                      <DeleteIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              ) : (
                <Tooltip title="Drop Index">
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => onDeleteIndex(index.index_name)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              )
            }
          >
            <ListItemIcon><SpeedIcon /></ListItemIcon>
            <ListItemText
              primary={(
                <div className={s.nameRow}>
                  <Typography variant="body1">
                    {index.index_name}
                  </Typography>
                  <IndexChips
                    is_primary={index.is_primary}
                    is_unique={index.is_unique}
                    index_type={index.index_type}
                  />
                </div>
              )}
              secondary={`Columns: ${index.columns.join(', ')}`}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
