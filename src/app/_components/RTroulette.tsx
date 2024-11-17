"use client";

import React, { useState } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { Wheel } from "react-custom-roulette";

interface UserData {
  id: string;
  name: string;
  option: string;
}

const COLOR_PALETTE = [
  "#FF6384", "#36A2EB", "#FFCE56", "#FF9F40", "#4BC0C0",
  "#9966FF", "#FF6384", "#36A2EB", "#FFCE56", "#FF9F40",
];

const RTroulette: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [mustSpin, setMustSpin] = useState(false);
  const [tweetId, setTweetId] = useState<string>("");
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [bearerToken, setBearerToken] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserData[]>([]);

  const fetchRetweeters = async (nextToken?: string) => {
    if (!bearerToken) {
      setError("Bearerトークンを入力してください。");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/getRetweeter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tweetId, bearerToken, nextToken }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "データ取得中にエラーが発生しました。");
      }

      const { data, _ } = await response.json();
      setUsers((prevUsers) => [...prevUsers, ...data]);
    } catch (err: any) {
      setError(err.message || "データ取得中にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleSpinClick = () => {
    if (!mustSpin && users.length > 0) {
      const newPrizeNumber = Math.floor(Math.random() * users.length);
      setPrizeNumber(newPrizeNumber);
      setMustSpin(true);
    }
  };

  const handleSpinEnd = () => {
    setMustSpin(false);
    if (users[prizeNumber]) {
      const winner = users[prizeNumber];
      setSelectedUsers((prev) => [...prev, winner]);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const tweetIdInputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    // idまたはURL, urlなら自動でidに変換
    const tweetId = e.target.value;
    const tweetIdMatch = tweetId.match(/(\d{18})/);
    if (tweetIdMatch) {
      setTweetId(tweetIdMatch[0]);
    } else {
      setTweetId("");
    }
  }

  return (
    <div style={{
      padding: "20px",
    }}>
      <Typography variant="h4">リツイート抽選</Typography>
      <br />
      <div>
        <Button variant="contained" color="primary" onClick={() => setIsDialogOpen(true)}>
          {bearerToken ? "トークン再登録" : "トークン登録"}
        </Button>
        {bearerToken === "" && <span style={{
          marginLeft: "10px",
          color: "red",
        }}>トークンを設定してください</span>
        }
      </div>
      <Dialog open={isDialogOpen} onClose={handleDialogClose}>
        <DialogTitle>Bearerトークンを入力</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="password"
            label="Bearerトークン"
            value={bearerToken}
            onChange={(e) => setBearerToken(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>キャンセル</Button>
          <Button onClick={handleDialogClose} color="primary">
            保存
          </Button>
        </DialogActions>
      </Dialog>
      <div style={{
        margin: "20px 0",
        display: "flex",
        justifyContent: "space-between",
        gap: "20px",
      }}>
        <TextField
          fullWidth
          label="ツイートIDまたはURL"
          value={tweetId}
          onChange={tweetIdInputHandler}
        />
        <Button variant="contained" onClick={() => fetchRetweeters()} disabled={loading || !tweetId || bearerToken === ""}>
          取得
        </Button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {
        selectedUsers.length > 0 && (
          <>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleSpinClick}
              disabled={users.length === 0 || mustSpin || loading}
            >
              抽選
            </Button>
            <div style={{ marginTop: "20px" }}>
              <div>当選者一覧</div>
              <ul>
                {selectedUsers.map((user, index) => (
                  <li key={index}>
                    {user.name} ({user.option})
                  </li>
                ))}
              </ul>
            </div>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setSelectedUsers([])}
              style={{ marginLeft: "10px" }}
            >
              リセット
            </Button>
          </>
        )
      }
      {users.length > 0 && (
        <Wheel
          mustStartSpinning={mustSpin}
          prizeNumber={prizeNumber}
          data={users.map((user, index) => ({
            option: `${user.name}`,
            style: { backgroundColor: COLOR_PALETTE[index % COLOR_PALETTE.length] },
          }))}
          onStopSpinning={handleSpinEnd}
        />
      )}

      {users.length > 0 && (
        <div>
          <div>RTした人一覧</div>
          <ul>
            {users.map((user, index) => (
              <li key={index}>
                {user.name} ({user.option})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RTroulette;
