import { getDevicePtr, OnPeerDevicesMessage } from "modules/peer/device";
import { PeerDevicesMessage, PeerMessage } from "modules/peer/message";
import { JSONTools } from "modules/peer/tools";
import Peer, { Peer as TPeer } from "peerjs";
import create from "zustand";
import useButtplugStore from "./buttplug";

export interface PeerStoreState {
    peer?: TPeer,
    newPeerIfUndefined: () => Promise<TPeer | undefined>
}

const usePeerStore = create<PeerStoreState>((set, get) => ({
    peer: undefined,
    newPeerIfUndefined: async () => {
        if (get().peer) return get().peer;
        const { Peer } = await import('peerjs');
        const peer = new Peer();
        peer?.on("connection", (c) => {
            c.on("data", (data) => {
                const d = data as PeerMessage;
                const { devices } = useButtplugStore.getState();
                if (d.type === "devices") {
                    OnPeerDevicesMessage(d as PeerDevicesMessage, c);
                    c.send({ type: "devices", devices: JSONTools.strip(devices) } as PeerDevicesMessage)
                }
                if (d.type === "method") {
                    const device_index = devices.findIndex(e => getDevicePtr(e) === d.devicePtr);
                    if (device_index !== -1) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const args: unknown[] = (d as any).params || [];
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (devices[device_index] as any)[d.method](...args);
                    }
                    return;
                }
            })
        })
        peer.on("open", () => set((state) => ({peer: state.peer})));
        set(() => ({peer}));
        return get().peer;
    }
}));

export default usePeerStore