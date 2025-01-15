import React from "react";
import tw from "twin.macro";
import styled from "styled-components";
import { css } from "styled-components/macro";
import Header from "components/headers/light.js";
import Footer from "components/footers/FiveColumnWithInputForm.js";
import { SectionHeading } from "components/misc/Headings.js";
import { PrimaryButton } from "components/misc/Buttons.js";

const Container = tw.div`relative`;
const Content = tw.div`max-w-screen-xl mx-auto py-20 lg:py-24`;

const HeadingRow = tw.div`flex flex-col items-center`;
const Heading = tw(SectionHeading)`text-gray-900 mb-8`;
const Description = tw.p`text-center text-gray-600 max-w-sm`;

const StepsContainer = tw.div`mt-12 flex flex-col items-center`;
const StepsRow = tw.div`mt-8 flex flex-col lg:flex-row items-center lg:items-stretch`;

const Step = styled.div`
  ${tw`w-full lg:w-1/3 mt-8 lg:mt-0 lg:mx-4 flex flex-col items-center`}
`;

const StepNumber = styled.div`
  ${tw`w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center text-2xl font-bold`}
`;

const StepText = tw.div`mt-4 text-center`;
const StepHeading = tw.div`text-xl font-bold text-gray-900`;
const StepDescription = tw.div`mt-2 text-sm text-gray-600`;

const ActionButton = styled(PrimaryButton)`
  ${tw`mt-12`}
`;

export default () => {
  const steps = [
    {
      number: "1",
      heading: "提交申请",
      description: "填写您的网站信息，包括网站名称、URL、描述等基本信息。"
    },
    {
      number: "2",
      heading: "资质审核",
      description: "我们将对您提供的信息进行审核，确保符合平台规范。"
    },
    {
      number: "3",
      heading: "完成入驻",
      description: "审核通过后，您的网站将在我们的导航系统中展示。"
    }
  ];

  return (
    <Container>
      <Header />
      <Content>
        <HeadingRow>
          <Heading>网站入驻</Heading>
          <Description>
            加入我们的导航系统，让更多用户发现您的网站
          </Description>
        </HeadingRow>
        <StepsContainer>
          <StepsRow>
            {steps.map((step, index) => (
              <Step key={index}>
                <StepNumber>{step.number}</StepNumber>
                <StepText>
                  <StepHeading>{step.heading}</StepHeading>
                  <StepDescription>{step.description}</StepDescription>
                </StepText>
              </Step>
            ))}
          </StepsRow>
          <ActionButton>开始申请</ActionButton>
        </StepsContainer>
      </Content>
      <Footer />
    </Container>
  );
}; 