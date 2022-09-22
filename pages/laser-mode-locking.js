import Layout from "../components/layout";
import ShadowBox from "../components/containers/ShadowBox";

export default function LaserModeLocking() {
    return (
        <ShadowBox>
            <h1 className="text-3xl font-bold underline">
                Laser Mode Locking
            </h1>
        </ShadowBox>
    )
};

LaserModeLocking.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    )
};
