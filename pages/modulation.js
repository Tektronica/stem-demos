import Layout from "../components/layout";
import ShadowBox from "../components/containers/ShadowBox";

export default function Modulation() {
    return (
        <ShadowBox>
            <h1 className="text-3xl font-bold underline">
                Modulation
            </h1>
        </ShadowBox>
    )
};

Modulation.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    )
};
