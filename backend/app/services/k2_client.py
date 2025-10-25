from typing import Any, Dict, Optional

import httpx


class K2ClientError(RuntimeError):
    """Raised when the K2 service returns an unexpected response."""


class K2Client:
    def __init__(
        self,
        base_url: str,
        api_key: str,
        timeout: float = 10.0,
        transport: Optional[httpx.BaseTransport] = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.timeout = timeout
        self.transport = transport

    async def solve_steps(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return await self._post("/solve_steps", payload)

    async def explain_misconception(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return await self._post("/explain_misconception", payload)

    async def generate_alt_method(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        return await self._post("/generate_alt_method", payload)

    async def _post(self, path: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        url = f"{self.base_url}{path}"
        headers = {"Authorization": f"Bearer {self.api_key}"}
        async with httpx.AsyncClient(
            timeout=self.timeout, transport=self.transport
        ) as client:
            response = await client.post(
                url,
                json=payload,
                headers=headers,
            )
        if response.status_code >= 400:
            raise K2ClientError(
                f"K2 service error {response.status_code}: {response.text}"
            )
        try:
            data = response.json()
        except ValueError as exc:
            raise K2ClientError("K2 service returned non-JSON response") from exc

        if not isinstance(data, dict):
            raise K2ClientError("K2 service returned unexpected payload type")
        return data
