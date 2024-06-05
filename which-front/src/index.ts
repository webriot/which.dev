import { KVNamespace } from '@cloudflare/workers-types'

declare const profiles: KVNamespace

interface UserProfile {
    profile_id: string
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
        const path = url.pathname

        if (path.startsWith('/@')) {
            const profile_id = path.substring(2)
            return await renderProfilePage(profile_id)
        } else {
            return new Response('Invalid path', { status: 404 })
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return new Response(`Worker error: ${errorMessage}`, { status: 500 })
    }
}

async function renderProfilePage(profile_id: string): Promise<Response> {
    try {
        const data = await profiles.get<UserProfile>(profile_id, { type: 'json' })
        if (!data) {
            return new Response('Profile not found', { status: 404 })
        }

        const theme = data.theme || 'light'
        let backgroundColor, textColor, linkColor, customStyles

        switch (theme) {
            case 'dark':
                backgroundColor = '#121212'
                textColor = '#ffffff'
                linkColor = '#bb86fc'
                break
            case 'fallout':
                backgroundColor = '#000000'
                textColor = '#00FF00'
                linkColor = '#00FF00'
                customStyles = `
                    .container {
                        font-family: 'Courier New', Courier, monospace;
                        text-transform: uppercase;
                    }
                    a {
                        font-weight: bold;
                    }
                `
                break
            case 'light':
            default:
                backgroundColor = '#ffffff'
                textColor = '#000000'
                linkColor = '#007acc'
                break
        }

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${data.firstName} ${data.lastName}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: ${backgroundColor}; color: ${textColor}; }
                    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
                    h1 { font-size: 2em; }
                    p { line-height: 1.6; }
                    a { color: ${linkColor}; text-decoration: none; }
                    ${customStyles || ''}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>${data.firstName} ${data.lastName}</h1>
                    <p><strong>Job Title:</strong> ${data.jobTitle}</p>
                    <p><strong>Company:</strong> ${data.company}</p>
                    <p><strong>About Me:</strong> ${data.aboutMe}</p>
                    <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
                    <p><strong>GitHub:</strong> <a href="${data.githubUrl}" target="_blank">${data.githubUrl}</a></p>
                    <p><strong>GitLab:</strong> <a href="${data.gitlabUrl}" target="_blank">${data.gitlabUrl}</a></p>
                </div>
            </body>
            </html>
        `
        return new Response(html, {
            headers: { 'Content-Type': 'text/html' }
        })
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        return new Response(`Error rendering profile: ${errorMessage}`, { status: 500 })
    }
}