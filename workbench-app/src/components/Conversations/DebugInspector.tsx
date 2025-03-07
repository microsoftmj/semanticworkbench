// Copyright (c) Microsoft. All rights reserved.

import { Button, DialogOpenChangeData, DialogOpenChangeEvent, Tooltip, makeStyles } from '@fluentui/react-components';
import { Info16Regular } from '@fluentui/react-icons';
import React from 'react';
import { JSONTree } from 'react-json-tree';
import { DialogControl } from '../App/DialogControl';
import { Loading } from '../App/Loading';
import { ContentRenderer } from './ContentRenderers/ContentRenderer';

const useClasses = makeStyles({
    root: {
        maxWidth: 'calc(100vw - 32px)',
        minWidth: 'min(600px, 100vw)',
        width: 'fit-content',
    },
    content: {
        height: 'calc(100vh - 150px)',
        width: 'calc(100vw - 100px)',
        paddingRight: '8px',
        boxSizing: 'border-box',
    },
});

interface DebugInspectorProps {
    debug?: { [key: string]: any };
    loading?: boolean;
    trigger?: JSX.Element;
    onOpen?: () => void;
    onClose?: () => void;
}

export const DebugInspector: React.FC<DebugInspectorProps> = (props) => {
    const { debug, loading, trigger, onOpen, onClose } = props;
    const classes = useClasses();

    const onOpenChanged = React.useCallback(
        (_: DialogOpenChangeEvent, data: DialogOpenChangeData) => {
            if (data.open) {
                onOpen?.();
                return;
            }
            onClose?.();
        },
        [onOpen, onClose],
    );

    if (!debug) {
        return null;
    }

    return (
        <DialogControl
            trigger={
                trigger || (
                    <Tooltip
                        content="Display debug information to indicate how this content was created."
                        relationship="label"
                    >
                        <Button appearance="subtle" size="small" icon={<Info16Regular />} />
                    </Tooltip>
                )
            }
            classNames={{ dialogSurface: classes.root }}
            title="Debug Inspection"
            onOpenChange={onOpenChanged}
            content={
                loading ? (
                    <Loading />
                ) : debug.content ? (
                    <ContentRenderer content={debug.content} contentType={debug.contentType} />
                ) : (
                    <div className={classes.content}>
                        <JSONTree
                            data={debug}
                            hideRoot
                            invertTheme
                            collectionLimit={10}
                            shouldExpandNodeInitially={(keyPath, _data, level) => {
                                // Intended to be processed in order of appearance, written to
                                // exit early if the criteria is met, fallthrough to the next
                                // condition if it is not and eventually return true.

                                // Leave any of the following keys collapsed
                                const keepCollapsed = ['content_safety', 'content_filter_results', 'image_url'];
                                if (keepCollapsed.includes(String(keyPath[0]))) {
                                    return false;
                                }

                                // Expand the following keys by default
                                const keepExpanded = ['choices'];
                                if (keepExpanded.includes(String(keyPath[0]))) {
                                    return true;
                                }

                                // Collapse at specified level by default.
                                // By only returning false for the specified level, we can collapse
                                // all nodes at that level but still expand the rest, including their
                                // children so that they are easy to view after expanding the parent.
                                if (level === 3) {
                                    return false;
                                }

                                // Expand all other nodes by default.
                                return true;
                            }}
                            theme={{
                                base00: '#000000',
                                base01: '#303030',
                                base02: '#505050',
                                base03: '#b0b0b0',
                                base04: '#d0d0d0',
                                base05: '#e0e0e0',
                                base06: '#f5f5f5',
                                base07: '#ffffff',
                                base08: '#fb0120',
                                base09: '#fc6d24',
                                base0A: '#fda331',
                                base0B: '#a1c659',
                                base0C: '#76c7b7',
                                base0D: '#6fb3d2',
                                base0E: '#d381c3',
                                base0F: '#be643c',
                            }}
                        />
                    </div>
                )
            }
        />
    );
};
