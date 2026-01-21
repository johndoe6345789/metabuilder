/**
 * Example: Config-Driven Table Manager using componentTrees
 * Demonstrates refactoring a component to be fully config-driven
 */
'use client';

import { useState, useCallback } from 'react';
import { getComponentTree, getFeatureById, getDataTypes } from '@/utils/featureConfig';
import { ComponentTreeRenderer } from '@/utils/componentTreeRenderer';
import { useTables } from '@/hooks';

export default function ConfigDrivenTableManager() {
  // Get feature config
  const feature = getFeatureById('table-management');
  const tree = getComponentTree('TableManagerTab');
  const dataTypes = getDataTypes();

  // Use hooks for business logic
  const { tables, loading, error, createTable, dropTable } = useTables();

  // Local state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [dropDialogOpen, setDropDialogOpen] = useState(false);
  const [selectedTableToDrop, setSelectedTableToDrop] = useState('');

  // Action handlers
  const actions = {
    openCreateDialog: useCallback(() => {
      setCreateDialogOpen(true);
    }, []),
    
    openDropDialog: useCallback(() => {
      setDropDialogOpen(true);
    }, []),
    
    handleCreateTable: useCallback(async (tableName: string, columns: any[]) => {
      try {
        await createTable(tableName, columns);
        setCreateDialogOpen(false);
      } catch (err) {
        console.error('Failed to create table:', err);
      }
    }, [createTable]),
    
    handleDropTable: useCallback(async () => {
      if (selectedTableToDrop) {
        try {
          await dropTable(selectedTableToDrop);
          setDropDialogOpen(false);
          setSelectedTableToDrop('');
        } catch (err) {
          console.error('Failed to drop table:', err);
        }
      }
    }, [dropTable, selectedTableToDrop]),
  };

  // Prepare data for component tree
  const componentData = {
    feature,
    tables,
    loading,
    error,
    dataTypes,
    canCreate: feature?.ui?.actions.includes('create'),
    canDelete: feature?.ui?.actions.includes('delete'),
  };

  if (!tree) {
    return <div>Component tree not found for TableManagerTab</div>;
  }

  return (
    <div>
      <h3>Config-Driven Table Manager</h3>
      <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
        This component uses componentTreeRenderer to render the UI from features.json
      </p>
      
      <ComponentTreeRenderer 
        tree={tree} 
        context={{ 
          data: componentData, 
          actions, 
          state: { 
            createDialogOpen,
            dropDialogOpen,
            selectedTableToDrop,
          } 
        }} 
      />
    </div>
  );
}
