export declare class Utils {
    static RangeInt(min: number, max: number): number;
    static RangeFloat(min: number, max: number): number;
    static PickArray<T>(array: T[]): T | undefined;
    static Timeout(ms: number): Promise<number>;
    static Immediate<T>(value?: T): Promise<T>;
    static NextTick<T>(value?: T): Promise<T>;
    private static hidIndex;
    static generateHID(): string;
}
