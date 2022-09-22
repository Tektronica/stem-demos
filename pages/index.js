import Layout from "../components/layout";
import ShadowBox from "../components/containers/ShadowBox";

export default function Home() {
  return (
    <ShadowBox>
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>
    </ShadowBox>
  )
};

Home.getLayout = function getLayout(page) {
  return (
    <Layout>
      {page}
    </Layout>
  )
};
