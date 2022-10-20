/* eslint-disable @typescript-eslint/no-explicit-any */
import { handler } from "modules/peer/handler";
import { PeerDevicesMessage } from "modules/peer/message";
import { JSONTools } from "modules/peer/tools";
import Peer from "peerjs";
import { FC, useEffect, useState } from "react";
import useButtplugStore from "store/buttplug";
import usePeerStore from "store/peer";

interface MultiplayerControllerProps {
    defaultId?: string
}

const MultiplayerController: FC<MultiplayerControllerProps> = ({ defaultId }) => {
    const { peer, newPeerIfUndefined } = usePeerStore();
    const { devices, client } = useButtplugStore();

    const [connectToPeerId, setConnectToPeerId] = useState("");

    const connect = async (id: string, peerInstance?: Peer) => {
        const p = peerInstance ?? peer;
        const conn = p?.connect(id);
        
        conn?.on('open', () => {
            conn.send({ type: "devices", devices: JSONTools.strip(devices) } as PeerDevicesMessage)
        })
        conn && handler(conn);
    }

    useEffect(() => {
        (async () => {
            if (defaultId) {
                const p = newPeerIfUndefined();
                if (p) {
                    p.once("open", () => {
                        setConnectToPeerId(defaultId);
                        connect(defaultId, p);  
                    })
                }
            }
        })()
    }, [defaultId])
    
    return (
        <div className="card space-y-3">
            <h1>Multiplayer (WIP!)</h1>
            <div className="space-y-3">
            Make sure to connect all your devices first before inviting someone! <br />
            {
                peer && (
                    <>
                        Your ID: <pre className="inline">{peer.id ?? "Loading..."}</pre>
                        <input className="input w-full" placeholder="Enter ID to Connect to" type="text" value={connectToPeerId} onChange={e => setConnectToPeerId(e.target.value)} />
                    </>
                )                    
            }
            </div>
            <div className="flex justify-end gap-3">
                {
                    !peer ? <button className="action" onClick={newPeerIfUndefined}>Enable Multiplayer</button> :
                    <>
                        <button className="action" onClick={() => navigator.clipboard.writeText(window.location.origin + "/play/" + peer.id)}>Copy Invite URL</button>
                        <button className="action" onClick={() => connect(connectToPeerId)}>Connect</button>
                    </>
                }
            </div>
        </div>
    );
}
export default MultiplayerController