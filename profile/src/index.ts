import { KVNamespace } from '@cloudflare/workers-types'
import { v4 as uuidv4 } from 'uuid'

declare const profiles: KVNamespace

interface UserProfile {
    profile_id?: string
    firstName: string
    lastName: string
    jobTitle: string
    company: string
    aboutMe: string
    email: string
    githubUrl: string
    gitlabUrl: string
    theme?: 'light' | 'dark' | 'fallout'
}

addEventListener('fetch', (event: FetchEvent) => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request: Request): Promise<Response> {
    try {
        const url = new URL(request.url)
        const pathSegments = url.pathname.split('/').filter(Boolean)

        if (pathSegments.length < 1 || pathSegments[0] !== 'profile') {
            return new Response('Invalid path', { status: 400 })
        }

        const action = pathSegments[1]
        const profile_id = pathSegments[2]

        switch (action) {
            case 'validate':
                return await validateKey(profile_id)
            case 'get':
                return await getUser(profile_id)
            case 'create':
                return await createUser(await request.json())
            case 'update':
                return await updateUser(profile_id, await request.json())
            case 'delete':
                return await deleteUser(profile_id)
            default:
                return new Response('Method not allowed', { status: 405 })
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return new Response(`Worker error: ${errorMessage}`, { status: 500 })
    }
}

async function validateKey(profile_id: string): Promise<Response> {
    try {
        const data = await profiles.get(profile_id)
        if (data) {
            return new Response('Key is already in use', { status: 409 })
        }
        return new Response('Key is available', { status: 200 })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return new Response(`Error validating key: ${errorMessage}`, { status: 500 })
    }
}

async function getUser(profile_id: string): Promise<Response> {
    try {
        const data = await profiles.get<UserProfile>(profile_id, { type: 'json' })
        if (!data) {
            return new Response('Data not found', { status: 404 })
        }
        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return new Response(`Error fetching data: ${errorMessage}`, { status: 500 })
    }
}

async function createUser(data: UserProfile): Promise<Response> {
    try {
        const profile_id = data.profile_id || uuidv4()
        const existingData = await profiles.get(profile_id)

        if (existingData) {
            return new Response('Profile ID already in use', { status: 409 })
        }

        data.profile_id = profile_id
        await profiles.put(profile_id, JSON.stringify(data))
        return new Response(JSON.stringify({ profile_id }), { status: 201 })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return new Response(`Error adding user: ${errorMessage}`, { status: 500 })
    }
}

async function updateUser(profile_id: string, data: Partial<UserProfile>): Promise<Response> {
    try {
        const existingData = await profiles.get<UserProfile>(profile_id, { type: 'json' })
        if (!existingData) {
            return new Response('Data not found', { status: 404 })
        }

        const updatedData: UserProfile = {
            ...existingData,
            ...data
        }
        await profiles.put(profile_id, JSON.stringify(updatedData))
        return new Response('User updated', { status: 200 })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return new Response(`Error updating user: ${errorMessage}`, { status: 500 })
    }
}

async function deleteUser(profile_id: string): Promise<Response> {
    try {
        await profiles.delete(profile_id)
        return new Response('User deleted', { status: 200 })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return new Response(`Error deleting user: ${errorMessage}`, { status: 500 })
    }
}