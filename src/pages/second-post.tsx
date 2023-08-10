import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import Layout from '../components/Layout/layout';

const FirstPost: React.FC = () => {
    return (
        <Layout>
            <Head>
                <title>First Post</title>
            </Head>
            <Script
                src="https://connect.facebook.net/en_US/sdk.js"
                strategy="lazyOnload"
                onLoad={() =>
                    console.log(`script loaded correctly, window.FB has been populated`)
                }
            />
            <h1>TAP!</h1>
            <h1>
                <Link href="/posts/second-post">画像をタップさせる予定</Link>
            </h1>
        </Layout>
    );
}

export default FirstPost;
