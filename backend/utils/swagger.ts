import swaggerUi from 'swagger-ui-express'

const swaggerSpec = {
    openapi: '3.0.0',
    info: {
        title: 'Imizi API',
        version: '1.0.0',
        description: 'Family memory platform API — authentication, family management, memories, stories, events, comments and uploads.',
        contact: {
            name: 'Imizi'
        }
    },
    servers: [
        {
            url: '/api/v1',
            description: 'API v1 (relative)'
        },
        {
            url: 'http://localhost:8080/api/v1',
            description: 'Local development'
        }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        },
        schemas: {
            ErrorResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string' }
                }
            },
            AuthSuccess: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string' },
                    token: { type: 'string', description: 'JWT bearer token' },
                    user: { $ref: '#/components/schemas/User' }
                }
            },
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    fullName: { type: 'string' },
                    email: { type: 'string' },
                    role: { type: 'string', enum: ['user', 'admin_family'] },
                    familyId: { type: 'string', nullable: true },
                    phoneNumber: { type: 'string', nullable: true }
                }
            },
            Family: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    familyName: { type: 'string' },
                    createdBy: { type: 'string' },
                    familyMembers: { type: 'array', items: { type: 'string' } },
                    treeData: { type: 'object' }
                }
            },
            Invitation: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    email: { type: 'string' },
                    familyId: { type: 'string' },
                    code: { type: 'string' },
                    status: { type: 'string', enum: ['pending', 'accepted', 'expired'] },
                    expiresAt: { type: 'string', format: 'date-time' }
                }
            },
            Memory: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    type: { type: 'string' },
                    mediaUrl: { type: 'string' },
                    thumbnailUrl: { type: 'string' },
                    tags: { type: 'array', items: { type: 'string' } },
                    location: { type: 'string' },
                    uploadedBy: { type: 'string' }
                }
            },
            Story: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    title: { type: 'string' },
                    content: { type: 'string' },
                    audioUrl: { type: 'string' },
                    toldBy: { type: 'string' },
                    author: { type: 'string' }
                }
            },
            Event: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    type: { type: 'string' },
                    date: { type: 'string', format: 'date-time' },
                    createdBy: { type: 'string' }
                }
            },
            Comment: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    content: { type: 'string' },
                    targetType: { type: 'string', enum: ['memory', 'story'] },
                    targetId: { type: 'string' },
                    userId: { type: 'string' }
                }
            }
        },
        responses: {
            BadRequest: {
                description: 'Bad request',
                content: {
                    'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } }
                }
            },
            Unauthorized: {
                description: 'Unauthorized — valid Bearer token required',
                content: {
                    'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } }
                }
            },
            Forbidden: {
                description: 'Forbidden',
                content: {
                    'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } }
                }
            },
            NotFound: {
                description: 'Not found',
                content: {
                    'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } }
                }
            },
            AuthOk: {
                description: 'Login successful',
                content: {
                    'application/json': { schema: { $ref: '#/components/schemas/AuthSuccess' } }
                }
            }
        }
    },
    security: [{ bearerAuth: [] }],
    paths: {
        '/health': {
            get: {
                summary: 'Health check',
                tags: ['System'],
                security: [],
                responses: {
                    200: {
                        description: 'Server is healthy',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: { message: { type: 'string' } }
                                }
                            }
                        }
                    }
                }
            }
        },

        '/auth/register': {
            post: {
                summary: 'Register a new user',
                tags: ['Auth'],
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['fullName', 'email', 'password'],
                                properties: {
                                    fullName: { type: 'string', example: 'Jane Doe' },
                                    email: { type: 'string', example: 'jane@example.com' },
                                    password: { type: 'string', example: 'secret123' },
                                    invitationCode: { type: 'string', description: 'Optional family invitation code' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'User registered',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    400: { $ref: '#/components/responses/BadRequest' }
                }
            }
        },
        '/auth/login': {
            post: {
                summary: 'Log in and receive a JWT',
                tags: ['Auth'],
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'password'],
                                properties: {
                                    email: { type: 'string', example: 'jane@example.com' },
                                    password: { type: 'string', example: 'secret123' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { $ref: '#/components/responses/AuthOk' },
                    400: { $ref: '#/components/responses/BadRequest' }
                }
            }
        },
        '/auth/forgot-password': {
            post: {
                summary: 'Request a password reset link',
                tags: ['Auth'],
                security: [],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email'],
                                properties: { email: { type: 'string', example: 'jane@example.com' } }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Reset link sent',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    400: { $ref: '#/components/responses/BadRequest' }
                }
            }
        },
        '/auth/reset-password/{resetToken}': {
            post: {
                summary: 'Reset password using a reset token',
                tags: ['Auth'],
                security: [],
                parameters: [
                    {
                        name: 'resetToken',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    },
                    {
                        name: 'email',
                        in: 'query',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['password'],
                                properties: { password: { type: 'string', example: 'newSecret123' } }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Password reset successful',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    400: { $ref: '#/components/responses/BadRequest' }
                }
            }
        },

        '/family/create': {
            post: {
                summary: 'Create a family space',
                tags: ['Family'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['familyName'],
                                properties: { familyName: { type: 'string', example: 'The Doe Family' } }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Family created',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string' },
                                        family: { $ref: '#/components/schemas/Family' }
                                    }
                                }
                            }
                        }
                    },
                    400: { $ref: '#/components/responses/BadRequest' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },
        '/family/invite': {
            post: {
                summary: 'Invite a relative by email',
                tags: ['Family'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['email', 'familyId'],
                                properties: {
                                    email: { type: 'string', example: 'relative@example.com' },
                                    familyId: { type: 'string', description: 'ID of the family to invite into' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Invitation sent',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string' },
                                        invitation: { $ref: '#/components/schemas/Invitation' }
                                    }
                                }
                            }
                        }
                    },
                    400: { $ref: '#/components/responses/BadRequest' },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    403: { $ref: '#/components/responses/Forbidden' }
                }
            }
        },
        '/family/join': {
            post: {
                summary: 'Join a family using an invitation code',
                tags: ['Family'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['code'],
                                properties: { code: { type: 'string', description: 'Invitation code' } }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Joined family',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        message: { type: 'string' },
                                        family: { $ref: '#/components/schemas/Family' }
                                    }
                                }
                            }
                        }
                    },
                    400: { $ref: '#/components/responses/BadRequest' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },
        '/family/my-family': {
            get: {
                summary: "Get the authenticated user's family",
                tags: ['Family'],
                responses: {
                    200: {
                        description: 'Family details',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        family: { $ref: '#/components/schemas/Family' }
                                    }
                                }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            }
        },
        '/family/tree': {
            get: {
                summary: "Get the authenticated user's family tree",
                tags: ['Family'],
                responses: {
                    200: {
                        description: 'Family tree data',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        family: { $ref: '#/components/schemas/Family' },
                                        generations: { type: 'object' }
                                    }
                                }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },
        '/family/invite/{code}': {
            get: {
                summary: 'View an invitation by code (public)',
                tags: ['Family'],
                security: [],
                parameters: [
                    {
                        name: 'code',
                        in: 'path',
                        required: true,
                        schema: { type: 'string' }
                    }
                ],
                responses: {
                    200: {
                        description: 'Invitation details',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        invitation: { $ref: '#/components/schemas/Invitation' }
                                    }
                                }
                            }
                        }
                    },
                    400: { $ref: '#/components/responses/BadRequest' },
                    404: { $ref: '#/components/responses/NotFound' }
                }
            }
        },
        '/family/invite-link': {
            post: {
                summary: 'Generate an invite link/code (family admin only)',
                tags: ['Family'],
                responses: {
                    200: {
                        description: 'Invite code generated',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        code: { type: 'string' },
                                        expiresAt: { type: 'string', format: 'date-time' }
                                    }
                                }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' },
                    403: { $ref: '#/components/responses/Forbidden' }
                }
            }
        },

        '/dashboard': {
            get: {
                summary: 'Get aggregated family dashboard data',
                tags: ['Dashboard'],
                responses: {
                    200: {
                        description: 'Dashboard data',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        hasFamily: { type: 'boolean' },
                                        data: { type: 'object' }
                                    }
                                }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },

        '/memories': {
            post: {
                summary: 'Create a memory',
                tags: ['Memories'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title', 'type'],
                                properties: {
                                    title: { type: 'string', example: 'Summer 2024' },
                                    description: { type: 'string' },
                                    type: { type: 'string', example: 'photo' },
                                    mediaUrl: { type: 'string' },
                                    thumbnailUrl: { type: 'string' },
                                    tags: { type: 'array', items: { type: 'string' } },
                                    location: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Memory created',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        memory: { $ref: '#/components/schemas/Memory' }
                                    }
                                }
                            }
                        }
                    },
                    400: { $ref: '#/components/responses/BadRequest' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            },
            get: {
                summary: 'List memories with optional filtering and pagination',
                tags: ['Memories'],
                parameters: [
                    { name: 'type', in: 'query', schema: { type: 'string' } },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
                    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } }
                ],
                responses: {
                    200: {
                        description: 'List of memories',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        memories: { type: 'array', items: { $ref: '#/components/schemas/Memory' } },
                                        total: { type: 'integer' },
                                        page: { type: 'integer' },
                                        limit: { type: 'integer' }
                                    }
                                }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },

        '/stories': {
            post: {
                summary: 'Create a story',
                tags: ['Stories'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title', 'content'],
                                properties: {
                                    title: { type: 'string', example: 'Grandma’s recipe' },
                                    content: { type: 'string' },
                                    audioUrl: { type: 'string' },
                                    toldBy: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Story created',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        story: { $ref: '#/components/schemas/Story' }
                                    }
                                }
                            }
                        }
                    },
                    400: { $ref: '#/components/responses/BadRequest' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            },
            get: {
                summary: 'List stories',
                tags: ['Stories'],
                responses: {
                    200: {
                        description: 'List of stories',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        stories: { type: 'array', items: { $ref: '#/components/schemas/Story' } }
                                    }
                                }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },

        '/events': {
            post: {
                summary: 'Create a family event',
                tags: ['Events'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['title', 'date'],
                                properties: {
                                    title: { type: 'string', example: 'Reunion' },
                                    description: { type: 'string' },
                                    type: { type: 'string' },
                                    date: { type: 'string', format: 'date-time' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Event created',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        event: { $ref: '#/components/schemas/Event' }
                                    }
                                }
                            }
                        }
                    },
                    400: { $ref: '#/components/responses/BadRequest' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            },
            get: {
                summary: 'List events (upcoming by default)',
                tags: ['Events'],
                parameters: [
                    {
                        name: 'upcoming',
                        in: 'query',
                        schema: { type: 'string', enum: ['true', 'false'], default: 'true' }
                    }
                ],
                responses: {
                    200: {
                        description: 'List of events',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        events: { type: 'array', items: { $ref: '#/components/schemas/Event' } }
                                    }
                                }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },

        '/comments': {
            post: {
                summary: 'Create a comment on a memory or story',
                tags: ['Comments'],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                required: ['content', 'targetType', 'targetId'],
                                properties: {
                                    content: { type: 'string' },
                                    targetType: { type: 'string', enum: ['memory', 'story'] },
                                    targetId: { type: 'string' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Comment created',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        comment: { $ref: '#/components/schemas/Comment' }
                                    }
                                }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },
        '/comments/{targetType}/{targetId}': {
            get: {
                summary: 'Get comments for a target',
                tags: ['Comments'],
                parameters: [
                    { name: 'targetType', in: 'path', required: true, schema: { type: 'string', enum: ['memory', 'story'] } },
                    { name: 'targetId', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: {
                        description: 'List of comments',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        comments: { type: 'array', items: { $ref: '#/components/schemas/Comment' } }
                                    }
                                }
                            }
                        }
                    },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        },

        '/upload': {
            post: {
                summary: 'Upload a file (image, audio, video)',
                tags: ['Upload'],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: {
                                type: 'object',
                                properties: {
                                    file: { type: 'string', format: 'binary' }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'File uploaded',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        success: { type: 'boolean', example: true },
                                        url: { type: 'string' },
                                        filename: { type: 'string' },
                                        size: { type: 'integer' },
                                        mimetype: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    400: { $ref: '#/components/responses/BadRequest' },
                    401: { $ref: '#/components/responses/Unauthorized' }
                }
            }
        }
    }
}

export function setupSwagger(app: import('express').Express): void {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    app.get('/api-docs.json', (_req, res) => {
        res.json(swaggerSpec)
    })
}

export default swaggerSpec
