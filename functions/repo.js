export async function onRequestGet({ env }) {
    const query = `{
        a: repository(owner: "NgThanhVinhVN", name: "NgThanhVinhVN.github.io") { stargazers { totalCount } forks { totalCount } }
        b: repository(owner: "NgThanhVinhVN", name: "Vencord") { stargazers { totalCount } forks { totalCount } }
        c: repository(owner: "NgThanhVinhVN", name: "Methods-Layer7") { stargazers { totalCount } forks { totalCount } }
        d: repository(owner: "NgThanhVinhVN", name: "AI-Notebooks") { stargazers { totalCount } forks { totalCount } }
    }`;

    const { data } = await (await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
            'accept': 'application/json',
            'authorization': `bearer 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`,
            'user-agent': 'NgThanhVinhVN'
        },
        body: JSON.stringify({ query }),
        cf: {
            cacheTtl: 3600,
            cacheEverything: true
        }
    })).json();

    const arr = Object.values(data);
    const res = [];
    for (let i = 0; i < arr.length; i++) {
        res.push({
            star: arr[i].stargazers.totalCount,
            fork: arr[i].forks.totalCount
        });
    }

    return new Response(JSON.stringify(res), {
        headers: {
            'content-type': 'application/json',
            'cache-control': 'public, max-age=3600'
        }
    });
}
