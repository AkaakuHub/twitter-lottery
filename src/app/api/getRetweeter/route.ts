import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface UserData {
  id: string;
  name: string;
  option: string;
}

interface ApiResponse {
  data: UserData[];
  meta?: {
    result_count: number;
    next_token?: string;
  };
}

const fetchAllRetweeters = async (
  tweetId: string,
  bearerToken: string,
  nextToken?: string,
  accumulatedData: UserData[] = []
): Promise<UserData[]> => {
  const headers = {
    Authorization: `Bearer ${bearerToken}`,
  };

  const params = nextToken ? { pagination_token: nextToken } : {};
  const baseUrl = `https://api.twitter.com/2/tweets/${tweetId}/retweeted_by`;

  const response = await axios.get(baseUrl, { headers, params });
  console.log(response.data);
  const { data, meta }: ApiResponse = response.data;


  const transformedData = data.map((user: UserData) => ({
    id: user.id,
    name: user.name,
    option: user.name,
  }));

  const allData = [...accumulatedData, ...transformedData];

  if (meta?.next_token) {
    return fetchAllRetweeters(tweetId, bearerToken, meta.next_token, allData);
  }

  return allData;
};

export async function POST(req: NextRequest) {
  const { tweetId, bearerToken } = await req.json();

  if (!bearerToken) {
    return NextResponse.json(
      { error: "Bearerトークンを入力してください。" },
      { status: 400 }
    );
  }

  try {
    const allData = await fetchAllRetweeters(tweetId, bearerToken);
    return NextResponse.json({ data: allData }, { status: 200 });
  } catch (err: any) {
    const rateLimitReset = err.response?.headers?.["x-rate-limit-reset"];
    const resetTime = rateLimitReset ? new Date(rateLimitReset * 1000).toISOString() : null;
    return NextResponse.json(
      {
        error: err.message || "データ取得中にエラーが発生しました。",
        rateLimitReset: resetTime,
      },
      { status: err.response?.status || 500 }
    );
  }

}
