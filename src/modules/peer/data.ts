import { ButtplugClientDevice, ButtplugMessageSorter, MessageAttributes, RotationCmd, VectorCmd, VibrationCmd } from "buttplug";
import { Buttplug } from "buttplug/dist/module/buttplug_ffi";
import { DataConnection } from "peerjs";
import useButtplugStore from "store/buttplug";
import { PeerCmdMessage, PeerDevicesMessage } from "./message";
import { JSONTools } from "./tools";

export class PeerDevice extends ButtplugClientDevice {
    connection?: DataConnection;

    async vibrate(...a: any): Promise<void> {
        this.connection?.send({ type: "method", method: "vibrate", params: a } as PeerCmdMessage);
    }
    async rotate(...a: any): Promise<void> {
        this.connection?.send({ type: "method", method: "rotate", params: a } as PeerCmdMessage);
    }
    async linear(...a: any): Promise<void> {
        this.connection?.send({ type: "method", method: "linear", params: a } as PeerCmdMessage);
    }
    batteryLevel(): Promise<number> {
        throw new Error("Method not implemented.");
    }
    rssiLevel(): Promise<number> {
        throw new Error("Method not implemented.");
    }
    rawRead(endpoint: Buttplug.Endpoint, expectedLength: number, timeout: number): Promise<Uint8Array> {
        throw new Error("Method not implemented.");
    }
    rawWrite(endpoint: Buttplug.Endpoint, data: Uint8Array, writeWithResponse: boolean): Promise<void> {
        throw new Error("Method not implemented.");
    }
    rawSubscribe(endpoint: Buttplug.Endpoint): Promise<void> {
        throw new Error("Method not implemented.");
    }
    rawUnsubscribe(endpoint: Buttplug.Endpoint): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async stop(): Promise<void> {
        this.connection?.send({ type: "method", method: "stop" } as PeerCmdMessage);
    }
    static fromJSON(i: any) {
        const input = {...i};
        const _sorter = new ButtplugMessageSorter();
        Object.assign(_sorter, input._sorter)
        const e = new PeerDevice(
            i._devicePtr, 
            _sorter,
            i._index,
            i._name,
            []
        );
        delete input["_sorter"]
        Object.assign(e, input)
        return e;
    }
    static fromJSONWithConnection(i: any, connection: DataConnection) {
        const ret = PeerDevice.fromJSON(i);
        ret.connection = connection;
        return ret;
    }
}

export const OnPeerDevicesMessage = (data: PeerDevicesMessage, c: DataConnection) => {
    const {devices, setDevices} = useButtplugStore.getState();
    const devices_ptrs = devices.map(e => (e as any)._devicePtr);
    
    const new_devices = JSONTools.unstrip(data.devices);
    const filtered_new_devices = new_devices.filter(e => !devices_ptrs.includes((e as any)._devicePtr));
    const instantiated_new_devices = filtered_new_devices.map(e => PeerDevice.fromJSONWithConnection(e, c));

    setDevices([...devices, ...instantiated_new_devices])
    // devices.findIndex(d)
}