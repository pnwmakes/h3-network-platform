'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
    UserGroupIcon,
    ChatBubbleLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
} from '@heroicons/react/24/outline';
import { UserIcon } from '@heroicons/react/24/solid';

interface TeamCollaborationProps {
    scheduledItems: Array<{
        id: string;
        title: string;
        contentType: 'VIDEO' | 'BLOG';
        publishAt: string;
        status: 'PENDING' | 'PUBLISHED' | 'FAILED' | 'NEEDS_APPROVAL';
        creatorId: string;
        creatorName: string;
        assignedReviewer?: {
            id: string;
            name: string;
            email: string;
        };
        comments?: Array<{
            id: string;
            content: string;
            author: {
                name: string;
                role: string;
            };
            createdAt: string;
        }>;
        approvalStatus?: 'pending' | 'approved' | 'changes_requested';
    }>;
    teamMembers: Array<{
        id: string;
        name: string;
        email: string;
        role: 'CREATOR' | 'EDITOR' | 'ADMIN';
        avatar?: string;
    }>;
    currentUserId: string;
    onAssignReviewer: (itemId: string, reviewerId: string) => void;
    onApprove: (itemId: string) => void;
    onRequestChanges: (itemId: string, comment: string) => void;
    onAddComment: (itemId: string, comment: string) => void;
}

export function TeamCollaboration({
    scheduledItems,
    teamMembers,
    currentUserId,
    onAssignReviewer,
    onApprove,
    onRequestChanges,
    onAddComment,
}: TeamCollaborationProps) {
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [newComment, setNewComment] = useState<string>('');
    const [changeRequest, setChangeRequest] = useState<string>('');
    const [showChangeModal, setShowChangeModal] = useState<string | null>(null);

    const reviewers = teamMembers.filter(
        (member) => member.role === 'EDITOR' || member.role === 'ADMIN'
    );

    const itemsNeedingReview = scheduledItems.filter(
        (item) => item.status === 'NEEDS_APPROVAL'
    );

    const handleAssignReviewer = (itemId: string, reviewerId: string) => {
        onAssignReviewer(itemId, reviewerId);
    };

    const handleAddComment = (itemId: string) => {
        if (newComment.trim()) {
            onAddComment(itemId, newComment.trim());
            setNewComment('');
        }
    };

    const handleRequestChanges = (itemId: string) => {
        if (changeRequest.trim()) {
            onRequestChanges(itemId, changeRequest.trim());
            setChangeRequest('');
            setShowChangeModal(null);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'text-yellow-600 bg-yellow-100';
            case 'NEEDS_APPROVAL':
                return 'text-orange-600 bg-orange-100';
            case 'PUBLISHED':
                return 'text-green-600 bg-green-100';
            case 'FAILED':
                return 'text-red-600 bg-red-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getApprovalStatusColor = (approvalStatus?: string) => {
        switch (approvalStatus) {
            case 'approved':
                return 'text-green-600 bg-green-100';
            case 'changes_requested':
                return 'text-red-600 bg-red-100';
            case 'pending':
                return 'text-yellow-600 bg-yellow-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    return (
        <div className='space-y-6'>
            {/* Review Queue */}
            {itemsNeedingReview.length > 0 && (
                <div className='bg-orange-50 border border-orange-200 rounded-lg p-4'>
                    <div className='flex items-center space-x-2 mb-3'>
                        <UserGroupIcon className='h-5 w-5 text-orange-600' />
                        <h3 className='text-lg font-medium text-orange-800'>
                            Review Queue ({itemsNeedingReview.length})
                        </h3>
                    </div>
                    <div className='text-sm text-orange-700'>
                        Content awaiting review and approval before publishing.
                    </div>
                </div>
            )}

            {/* Scheduled Content with Collaboration Features */}
            <div className='space-y-4'>
                {scheduledItems.map((item) => (
                    <div
                        key={item.id}
                        className='bg-white border rounded-lg shadow-sm'
                    >
                        {/* Item Header */}
                        <div className='p-4 border-b'>
                            <div className='flex items-start justify-between'>
                                <div className='flex-1'>
                                    <div className='flex items-center space-x-3'>
                                        <h4 className='text-lg font-medium text-gray-900'>
                                            {item.title}
                                        </h4>
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                                item.status
                                            )}`}
                                        >
                                            {item.status.replace('_', ' ')}
                                        </span>
                                        {item.approvalStatus && (
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getApprovalStatusColor(
                                                    item.approvalStatus
                                                )}`}
                                            >
                                                {item.approvalStatus.replace(
                                                    '_',
                                                    ' '
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    <div className='mt-1 text-sm text-gray-500'>
                                        {item.contentType} • by{' '}
                                        {item.creatorName} •{' '}
                                        {format(
                                            new Date(item.publishAt),
                                            'MMM d, yyyy h:mm a'
                                        )}
                                    </div>
                                </div>

                                <div className='flex items-center space-x-2'>
                                    {/* Reviewer Assignment */}
                                    {(item.status === 'NEEDS_APPROVAL' ||
                                        item.assignedReviewer) && (
                                        <div className='flex items-center space-x-2'>
                                            <UserIcon className='h-4 w-4 text-gray-400' />
                                            <select
                                                value={
                                                    item.assignedReviewer?.id ||
                                                    ''
                                                }
                                                onChange={(e) =>
                                                    handleAssignReviewer(
                                                        item.id,
                                                        e.target.value
                                                    )
                                                }
                                                className='text-sm border-gray-300 rounded-md'
                                            >
                                                <option value=''>
                                                    Assign reviewer...
                                                </option>
                                                {reviewers.map((reviewer) => (
                                                    <option
                                                        key={reviewer.id}
                                                        value={reviewer.id}
                                                    >
                                                        {reviewer.name} (
                                                        {reviewer.role})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Review Actions */}
                                    {item.status === 'NEEDS_APPROVAL' &&
                                        item.assignedReviewer?.id ===
                                            currentUserId && (
                                            <div className='flex items-center space-x-2'>
                                                <button
                                                    onClick={() =>
                                                        onApprove(item.id)
                                                    }
                                                    className='inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700'
                                                >
                                                    <CheckCircleIcon className='h-4 w-4 mr-1' />
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setShowChangeModal(
                                                            item.id
                                                        )
                                                    }
                                                    className='inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                                                >
                                                    <XCircleIcon className='h-4 w-4 mr-1' />
                                                    Request Changes
                                                </button>
                                            </div>
                                        )}
                                </div>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className='p-4'>
                            <div className='flex items-center justify-between mb-3'>
                                <div className='flex items-center space-x-2'>
                                    <ChatBubbleLeftIcon className='h-4 w-4 text-gray-400' />
                                    <span className='text-sm font-medium text-gray-700'>
                                        Comments ({item.comments?.length || 0})
                                    </span>
                                </div>
                                <button
                                    onClick={() =>
                                        setSelectedItem(
                                            selectedItem === item.id
                                                ? null
                                                : item.id
                                        )
                                    }
                                    className='text-sm text-blue-600 hover:text-blue-700'
                                >
                                    {selectedItem === item.id ? 'Hide' : 'Show'}{' '}
                                    Comments
                                </button>
                            </div>

                            {selectedItem === item.id && (
                                <div className='space-y-4'>
                                    {/* Existing Comments */}
                                    {item.comments &&
                                        item.comments.length > 0 && (
                                            <div className='space-y-3'>
                                                {item.comments.map(
                                                    (comment) => (
                                                        <div
                                                            key={comment.id}
                                                            className='bg-gray-50 rounded-lg p-3'
                                                        >
                                                            <div className='flex items-start justify-between'>
                                                                <div className='flex items-center space-x-2'>
                                                                    <span className='text-sm font-medium text-gray-900'>
                                                                        {
                                                                            comment
                                                                                .author
                                                                                .name
                                                                        }
                                                                    </span>
                                                                    <span className='text-xs text-gray-500'>
                                                                        {
                                                                            comment
                                                                                .author
                                                                                .role
                                                                        }
                                                                    </span>
                                                                    <span className='text-xs text-gray-400'>
                                                                        {format(
                                                                            new Date(
                                                                                comment.createdAt
                                                                            ),
                                                                            'MMM d, h:mm a'
                                                                        )}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className='mt-2 text-sm text-gray-700'>
                                                                {
                                                                    comment.content
                                                                }
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}

                                    {/* Add Comment */}
                                    <div className='flex space-x-3'>
                                        <textarea
                                            value={newComment}
                                            onChange={(e) =>
                                                setNewComment(e.target.value)
                                            }
                                            placeholder='Add a comment...'
                                            rows={2}
                                            className='flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                        />
                                        <button
                                            onClick={() =>
                                                handleAddComment(item.id)
                                            }
                                            disabled={!newComment.trim()}
                                            className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                                        >
                                            Comment
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Change Request Modal */}
            {showChangeModal && (
                <div className='fixed inset-0 z-50 overflow-y-auto'>
                    <div className='flex min-h-screen items-center justify-center p-4'>
                        <div
                            className='fixed inset-0 bg-black bg-opacity-25'
                            onClick={() => setShowChangeModal(null)}
                        />

                        <div className='relative bg-white rounded-lg shadow-xl w-full max-w-md'>
                            <div className='p-6'>
                                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                                    Request Changes
                                </h3>

                                <div className='space-y-4'>
                                    <div>
                                        <label
                                            htmlFor='changeRequest'
                                            className='block text-sm font-medium text-gray-700 mb-2'
                                        >
                                            What changes are needed?
                                        </label>
                                        <textarea
                                            id='changeRequest'
                                            rows={4}
                                            value={changeRequest}
                                            onChange={(e) =>
                                                setChangeRequest(e.target.value)
                                            }
                                            placeholder='Please describe the changes that need to be made...'
                                            className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                        />
                                    </div>

                                    <div className='flex space-x-3'>
                                        <button
                                            onClick={() =>
                                                setShowChangeModal(null)
                                            }
                                            className='flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleRequestChanges(
                                                    showChangeModal
                                                )
                                            }
                                            disabled={!changeRequest.trim()}
                                            className='flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed'
                                        >
                                            Request Changes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
