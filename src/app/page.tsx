'use client';


function Button() {
    async function handleClick() {

        const res = await fetch(('/api/openai'))
        console.log(res)
    }

    return (
        <button onClick={handleClick}>
            点我
        </button>
    );
}

export default function Home() {

    return (
        <div className={'bg-amber-800 h-full'}>
            <Button></Button>
        </div>
    )
}
