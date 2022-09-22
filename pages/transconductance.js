import Layout from "../components/layout";
import ShadowBox from "../components/containers/ShadowBox";

export default function Transconductance() {
    return (
        <ShadowBox>
            <h1 className="text-3xl font-bold underline">
                Transconductance
            </h1>
        </ShadowBox>
    )
};

Transconductance.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    )
};
