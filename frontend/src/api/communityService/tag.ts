// src/api/communityService/tag.ts
import { COMMUNITYSERVICE_API } from "@/config/env";

export async function getTags(communityId: number): Promise<string[]> {
  const url = `${COMMUNITYSERVICE_API}/tags/${communityId}`;

  const response = await fetch(url, {
    method: "GET",
  });

  if (response.ok) {
    return await response.json();
  } else {
    const errorText = await response.text();
    throw new Error(errorText || `태그 조회 실패: HTTP ${response.status}`);
  }
}