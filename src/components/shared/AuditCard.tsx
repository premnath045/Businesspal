import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generateLoaderInfo } from '@/lib/gemini-ai/generateLoaderInfo';

import GeminiLangChainComponent from '@/components/shared/GeminiLangChainComponent';

interface Post {
  id: string;
  businessName: string;
  businessDomain: string;
  businessLocation: string;
  description: string;
  generatedAudit?: {
    businessProfile?: {
      overview?: {
        history?: string;
        mission?: string;
        coreValues?: string[];
      };
      financialHealth?: {
        keyMetrics?: Array<{ metric: string; value: string }>;
      };
    };
    recommendations?: Array<{ area: string; recommendation: string }>;
    regionalAnalysis?: {
      swotAnalysis?: {
        strengths?: string[];
        weaknesses?: string[];
        opportunities?: string[];
        threats?: string[];
      };
    };
  };
}

// generative info loader
const InfoLoader: React.FC<{ post: Post }> = ({ post }) => {
  const [infoMessages, setInfoMessages] = useState<string[]>([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const facts = await generateLoaderInfo(
          post.businessName,
          post.businessDomain,
          post.businessLocation,
          post.description
        );
        setInfoMessages(facts);
      } catch (error) {
        console.error("Error fetching loader info:", error);
        setInfoMessages(["Unable to fetch business information."]);
      }
    };

    fetchInfo();
  }, [post]);

  useEffect(() => {
    if (infoMessages.length > 0) {
      const intervalId = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => 
          prevIndex === infoMessages.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Change message every 5 seconds

      return () => clearInterval(intervalId);
    }
  }, [infoMessages]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Generating Audit Report...</h2>
      {infoMessages.length > 0 && (
        <Alert>
          <AlertDescription>
            {infoMessages[currentMessageIndex].split('\n').map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};



const AuditReport: React.FC<{ post: Post }> = ({ post }) => {
  const [isLoading, setIsLoading] = useState(!post.generatedAudit);
  
  useEffect(() => {
    // report not yet generated condition 
    if (!post.generatedAudit) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 30000);

      return () => clearTimeout(timer);
    }
  }, [post.generatedAudit]);

  if (isLoading) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <InfoLoader post={post} />
      </div>
    );
  }

  if (!post.generatedAudit) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>No audit data available for this business.</AlertDescription>
        </Alert>
      </div>
    );
  }  

  // generated audit report section
  const { generatedAudit } = post;

  const financialData = generatedAudit.businessProfile?.financialHealth?.keyMetrics?.map(item => ({
    name: item.metric,
    value: parseFloat(item.value.replace(/[^0-9.]/g, ''))
  })) || [];

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{post.businessName.charAt(0).toUpperCase() + post.businessName.slice(1)} Dashboard</h1>
      <p className="text-lg mb-6">{post.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        
        <div className="App">
          <h1>My Gemini LangChain App</h1>
          <GeminiLangChainComponent />
        </div>
        
        
        <Card>
          <CardHeader>
            <CardTitle>Business Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {generatedAudit.businessProfile?.overview ? (
              <>
                <p><strong>History:</strong> {generatedAudit.businessProfile.overview.history || 'N/A'}</p>
                <p><strong>Mission:</strong> {generatedAudit.businessProfile.overview.mission || 'N/A'}</p>
                <div className="mt-4">
                  <strong>Core Values:</strong>
                  {generatedAudit.businessProfile.overview.coreValues && generatedAudit.businessProfile.overview.coreValues.length > 0 ? (
                    <ul className="list-disc pl-5 mt-2">
                      {generatedAudit.businessProfile.overview.coreValues.map((value, index) => (
                        <li key={index}>{value}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>No core values available</p>
                  )}
                </div>
              </>
            ) : (
              <p>No business overview available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Health</CardTitle>
          </CardHeader>
          <CardContent>
            {financialData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financialData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p>No financial data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          {generatedAudit.recommendations && generatedAudit.recommendations.length > 0 ? (
            generatedAudit.recommendations.map((rec, index) => (
              <Alert key={index} className="mb-4">
                <AlertTitle>{rec.area}</AlertTitle>
                <AlertDescription>{rec.recommendation}</AlertDescription>
              </Alert>
            ))
          ) : (
            <p>No recommendations available</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SWOT Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {generatedAudit.regionalAnalysis?.swotAnalysis ? (
            <Tabs defaultValue="strengths">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
                <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                <TabsTrigger value="threats">Threats</TabsTrigger>
              </TabsList>
              {Object.entries(generatedAudit.regionalAnalysis.swotAnalysis).map(([key, values]) => (
                <TabsContent key={key} value={key}>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    {values && values.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {values.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>No {key} available</p>
                    )}
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <p>No SWOT analysis available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditReport;