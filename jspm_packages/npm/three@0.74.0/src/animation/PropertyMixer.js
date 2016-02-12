/* */ 
(function(Buffer) {
  THREE.PropertyMixer = function(binding, typeName, valueSize) {
    this.binding = binding;
    this.valueSize = valueSize;
    var bufferType = Float64Array,
        mixFunction;
    switch (typeName) {
      case 'quaternion':
        mixFunction = this._slerp;
        break;
      case 'string':
      case 'bool':
        bufferType = Array, mixFunction = this._select;
        break;
      default:
        mixFunction = this._lerp;
    }
    this.buffer = new bufferType(valueSize * 4);
    this._mixBufferRegion = mixFunction;
    this.cumulativeWeight = 0;
    this.useCount = 0;
    this.referenceCount = 0;
  };
  THREE.PropertyMixer.prototype = {
    constructor: THREE.PropertyMixer,
    accumulate: function(accuIndex, weight) {
      var buffer = this.buffer,
          stride = this.valueSize,
          offset = accuIndex * stride + stride,
          currentWeight = this.cumulativeWeight;
      if (currentWeight === 0) {
        for (var i = 0; i !== stride; ++i) {
          buffer[offset + i] = buffer[i];
        }
        currentWeight = weight;
      } else {
        currentWeight += weight;
        var mix = weight / currentWeight;
        this._mixBufferRegion(buffer, offset, 0, mix, stride);
      }
      this.cumulativeWeight = currentWeight;
    },
    apply: function(accuIndex) {
      var stride = this.valueSize,
          buffer = this.buffer,
          offset = accuIndex * stride + stride,
          weight = this.cumulativeWeight,
          binding = this.binding;
      this.cumulativeWeight = 0;
      if (weight < 1) {
        var originalValueOffset = stride * 3;
        this._mixBufferRegion(buffer, offset, originalValueOffset, 1 - weight, stride);
      }
      for (var i = stride,
          e = stride + stride; i !== e; ++i) {
        if (buffer[i] !== buffer[i + stride]) {
          binding.setValue(buffer, offset);
          break;
        }
      }
    },
    saveOriginalState: function() {
      var binding = this.binding;
      var buffer = this.buffer,
          stride = this.valueSize,
          originalValueOffset = stride * 3;
      binding.getValue(buffer, originalValueOffset);
      for (var i = stride,
          e = originalValueOffset; i !== e; ++i) {
        buffer[i] = buffer[originalValueOffset + (i % stride)];
      }
      this.cumulativeWeight = 0;
    },
    restoreOriginalState: function() {
      var originalValueOffset = this.valueSize * 3;
      this.binding.setValue(this.buffer, originalValueOffset);
    },
    _select: function(buffer, dstOffset, srcOffset, t, stride) {
      if (t >= 0.5) {
        for (var i = 0; i !== stride; ++i) {
          buffer[dstOffset + i] = buffer[srcOffset + i];
        }
      }
    },
    _slerp: function(buffer, dstOffset, srcOffset, t, stride) {
      THREE.Quaternion.slerpFlat(buffer, dstOffset, buffer, dstOffset, buffer, srcOffset, t);
    },
    _lerp: function(buffer, dstOffset, srcOffset, t, stride) {
      var s = 1 - t;
      for (var i = 0; i !== stride; ++i) {
        var j = dstOffset + i;
        buffer[j] = buffer[j] * s + buffer[srcOffset + i] * t;
      }
    }
  };
})(require('buffer').Buffer);
