import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Sector,
  Cell
} from 'recharts';

import { generateLoaderInfo } from '@/lib/gemini-ai/generateLoaderInfo';

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
      productsServices?: Array<{ 
        name: string; 
        description: string; 
        uniqueSellingProposition: string;
        revenueShare: number;
      }>;
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
    customerBaseAnalysis?: {
      demographics: Array<{ factor: string; description: string }>;
      psychographics: Array<{ factor: string; description: string }>;
      customerFeedback: { keyInsights: string[] };
    };
    marketTrendAnalysis?: {
      emergingTrends: Array<{ trend: string; impact: number }>;
    };
    opportunityAnalysis?: {
      growthAreas: Array<{ area: string; potential: string }>;
      potentialPartnerships: Array<{ partner: string; benefit: string }>;
      productServiceExpansions: Array<{ idea: string; rationale: string }>;
      technologicalOpportunities: Array<{ technology: string; application: string }>;
    };
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

// product revene piechart code
const renderActiveShape = (props) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`Revenue Share ${value}%`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const CustomActiveShapePieChart = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={100}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
          onMouseEnter={onPieEnter}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};



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
      }, 5000);

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

  const {
    businessName,
    businessDomain,
    businessLocation,
    description,
    generatedAudit
  } = post;

  const productsServices = generatedAudit?.businessProfile?.productsServices;
  const summary = generatedAudit?.businessProfile?.financialHealth?.summary;
  const sources = generatedAudit?.sources;

  const {
    businessProfile,
    recommendations,
    regionalAnalysis,
    customerBaseAnalysis,
    marketTrendAnalysis,
    opportunityAnalysis,
  } = generatedAudit;

  const financialData = businessProfile?.financialHealth?.keyMetrics?.map(item => ({
    name: item.metric,
    value: parseFloat(item.value.replace(/[^0-9.]/g, ''))
  })) || [];

  console.log('Full post object:', post);


  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{businessName.charAt(0).toUpperCase() + businessName.slice(1)} Report</h1>
      <p className="text-lg mb-6">{summary}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Business Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>Domain:</strong> {businessDomain}</p>
            <p><strong>Location:</strong> {businessLocation}</p>
            <p><strong>History:</strong> {businessProfile?.overview?.history}</p>
            <p><strong>Mission:</strong> {businessProfile?.overview?.mission}</p>
            <div className="mt-4">
              <strong>Core Values:</strong>
              <ul className="list-disc pl-5 mt-2">
                {businessProfile?.overview?.coreValues?.map((value, index) => (
                  <li key={index}>{value}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Health</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={financialData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" name="Value (Billions $)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
          <CardFooter className="text-sm text-gray-500">
            All financial metrics are converted to billions of USD for consistent comparison.
          </CardFooter>
        </Card>
      </div>

      { productsServices && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Key Products & Services</CardTitle>
          </CardHeader>
          <CardContent>
            {productsServices.map((product, index) => (
              <Alert key={index} className="mb-4">
                <AlertTitle>{product.name}</AlertTitle>
                <AlertDescription>
                  <p>{product.description}</p>
                  <p className="mt-2"><strong>USP:</strong> {product.uniqueSellingProposition}</p>
                  <p className="mt-2"><strong>Revenue Share:</strong> {product.revenueShare}%</p>
                </AlertDescription>
              </Alert>
            ))}

            <CustomActiveShapePieChart 
              data={productsServices
                .filter(product => product.revenueShare)
                .map(product => ({
                  name: product.name,
                  value: parseFloat(product.revenueShare.replace('%', ''))
                }))
              }
            />
          </CardContent>
        </Card>
      )}

      {customerBaseAnalysis && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Customer Base Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="demographics">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
                <TabsTrigger value="psychographics">Psychographics</TabsTrigger>
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
              </TabsList>
              <TabsContent value="demographics">
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  {customerBaseAnalysis.demographics.map((item, index) => (
                    <div key={index} className="mb-2">
                      <strong>{item.factor}:</strong> {item.description}
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="psychographics">
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  {customerBaseAnalysis.psychographics.map((item, index) => (
                    <div key={index} className="mb-2">
                      <strong>{item.factor}:</strong> {item.description}
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="feedback">
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  {customerBaseAnalysis.customerFeedback.keyInsights.map((insight, index) => (
                    <p key={index}>{insight}</p>
                  ))}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {marketTrendAnalysis && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Market Trend Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart outerRadius={90} data={marketTrendAnalysis.emergingTrends}>
                <PolarGrid />
                <PolarAngleAxis dataKey="trend" />
                <PolarRadiusAxis angle={30} domain={[0, 150]} />
                <Radar name="Impact" dataKey="impact" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {opportunityAnalysis && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Opportunity Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="growthAreas">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="growthAreas">Growth Areas</TabsTrigger>
                <TabsTrigger value="partnerships">Partnerships</TabsTrigger>
                <TabsTrigger value="expansions">Expansions</TabsTrigger>
                <TabsTrigger value="tech">Tech Opportunities</TabsTrigger>
              </TabsList>
              {['growthAreas', 'potentialPartnerships', 'productServiceExpansions', 'technologicalOpportunities'].map((key) => (
                <TabsContent key={key} value={key === 'growthAreas' ? 'growthAreas' : 
                                              key === 'potentialPartnerships' ? 'partnerships' : 
                                              key === 'productServiceExpansions' ? 'expansions' : 'tech'}>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    {opportunityAnalysis[key].map((item, index) => (
                      <div key={index} className="mb-2">
                        <strong>{item.area || item.partner || item.idea || item.technology}:</strong> {item.potential || item.benefit || item.rationale || item.application}
                      </div>
                    ))}
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      {recommendations && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {recommendations.map((rec, index) => (
              <Alert key={index} className="mb-4">
                <AlertTitle>{rec.area}</AlertTitle>
                <AlertDescription>{rec.recommendation}</AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {regionalAnalysis && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Regional Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="competitors">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="competitors">Competitors</TabsTrigger>
                <TabsTrigger value="trends">Industry Trends</TabsTrigger>
                <TabsTrigger value="position">Market Position</TabsTrigger>
              </TabsList>
              <TabsContent value="competitors">
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  {regionalAnalysis.competitors?.map((competitor, index) => (
                    <div key={index} className="mb-4">
                      <h3 className="font-bold">{competitor.name}</h3>
                      <p><strong>Strengths:</strong> {competitor.strengths.join(', ')}</p>
                      <p><strong>Weaknesses:</strong> {competitor.weaknesses.join(', ')}</p>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="trends">
                <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                  {regionalAnalysis.industryTrends?.map((trend, index) => (
                    <div key={index} className="mb-2">
                      <strong>{trend.trend}:</strong> {trend.impact}
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
              <TabsContent value="position">
                <p><strong>Market Share:</strong> {regionalAnalysis.marketPosition?.marketShare}</p>
                <p><strong>Positioning:</strong> {regionalAnalysis.marketPosition?.positioning}</p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {regionalAnalysis?.swotAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>SWOT Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="strengths">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
                <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                <TabsTrigger value="threats">Threats</TabsTrigger>
              </TabsList>
              {Object.entries(regionalAnalysis.swotAnalysis).map(([key, values]) => (
                <TabsContent key={key} value={key}>
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    <ul className="list-disc pl-5">
                      {values?.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

      { sources && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Sources</CardTitle>
            <CardDescription>References used to generate this audit report</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <ul className="space-y-4">
                {generatedAudit.sources.map((source, index) => (
                  <li key={index} className="flex items-start space-x-4">
                    <div className="bg-blue-100 rounded-full p-2">
                      <ExternalLink className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg">{source.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{source.description}</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(source.url, '_blank', 'noopener,noreferrer')}
                      >
                        Visit Source
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

    </div>
  );
};

export default AuditReport;